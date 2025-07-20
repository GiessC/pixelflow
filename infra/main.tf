provider "aws" {
  region = var.aws_region
  profile = var.aws_profile
}

resource "aws_s3_bucket" "pixelflow_images" {
  bucket = "pixelflow-${var.environment}-images"

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_cors_configuration" "pixelflow_images_cors" {
  bucket = aws_s3_bucket.pixelflow_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.allowed_origins
    expose_headers  = []
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "pixelflow_images_public_access" {
  bucket = aws_s3_bucket.pixelflow_images.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "pixelflow_images_policy" {
  bucket = aws_s3_bucket.pixelflow_images.id

  policy = data.aws_iam_policy_document.pixelflow_images_policy.json
}

data "aws_iam_policy_document" "pixelflow_images_policy" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.pixelflow_images.arn,
      "${aws_s3_bucket.pixelflow_images.arn}/*"
    ]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_dynamodb_table" "pixelflow_main" {
  depends_on = [ aws_dynamodb_table.pixelflow_main ]
  name = "pixelflow-${var.environment}-main"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled = false
  }
}

resource "null_resource" "api_build" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/../api/"
    command     = <<-EOT
      npm ci
      npm run build
    EOT
  }
}

data "archive_file" "upload_image_lambda_zip" {
  depends_on = [null_resource.api_build]
  type = "zip"
  source_file = "${path.module}/../api/dist/lambdas/images/upload-image-lambda.js"
  output_path = "${path.module}/../api/dist/lambdas/images/upload-image-lambda.zip"
}

resource "aws_iam_role_policy" "upload_image_role_policy" {
  name = "pixelflow-${var.environment}-upload-image-policy"
  role = aws_iam_role.upload_image_role.id

  policy = data.aws_iam_policy_document.upload_image_policy.json
}

data "aws_iam_policy_document" "upload_image_policy" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchWriteItem",
    ]

    resources = [
      aws_dynamodb_table.pixelflow_main.arn
    ]
  }
}

data "aws_iam_policy_document" "upload_image_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "upload_image_role_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.upload_image_role.id
}

resource "aws_iam_role" "upload_image_role" {
  name = "pixelflow-${var.environment}-upload-image"

  assume_role_policy = data.aws_iam_policy_document.upload_image_assume_role_policy.json
}

resource "aws_lambda_function" "pixelflow_upload_image" {
  function_name = "pixelflow-${var.environment}-upload-image"
  filename = data.archive_file.upload_image_lambda_zip.output_path
  source_code_hash = data.archive_file.upload_image_lambda_zip.output_base64sha256
  runtime          = "nodejs22.x"
  role             = aws_iam_role.upload_image_role.arn
  timeout          = 10
  memory_size      = 128
  handler          = "upload-image-lambda.handler"
  environment {
    variables = {
      IMAGE_TABLE_NAME = aws_dynamodb_table.pixelflow_main.name
    }
  }
}

resource "aws_lambda_permission" "pixelflow_upload_image_permission" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pixelflow_upload_image.function_name
  principal     = "s3.amazonaws.com"

  source_arn = aws_s3_bucket.pixelflow_images.arn
}

resource "aws_s3_bucket_notification" "pixelflow_upload_image_notification" {
  bucket = aws_s3_bucket.pixelflow_images.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.pixelflow_upload_image.arn
    events              = ["s3:ObjectCreated:Put"]
  }

  depends_on = [aws_lambda_permission.pixelflow_upload_image_permission]

}

resource "aws_cognito_user_pool" "pixelflow_user_pool" {
  name = "pixelflow-${var.environment}-user-pool"
}

resource "aws_cognito_user_pool_client" "pixelflow_user_pool_client" {
  name         = "pixelflow-${var.environment}-user-pool-client"
  user_pool_id = aws_cognito_user_pool.pixelflow_user_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
