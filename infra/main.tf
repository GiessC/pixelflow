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
  auto_verified_attributes = ["email"]

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_LINK"
  }
}

resource "aws_cognito_user_pool_client" "pixelflow_user_pool_client" {
  name         = "pixelflow-${var.environment}-user-pool-client"
  user_pool_id = aws_cognito_user_pool.pixelflow_user_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}

resource "aws_cognito_user_pool_domain" "pixelflow_user_pool_domain" {
  domain       = "pixelflow-${var.environment}-user-pool-domain"
  user_pool_id = aws_cognito_user_pool.pixelflow_user_pool.id
}

resource "aws_api_gateway_rest_api" "pixelflow_api" {
  name        = "pixelflow-${var.environment}-api"
  description = "Pixelflow API"
}

resource "aws_iam_role_policy" "pixelflow_images_router_policy" {
  name = "pixelflow-${var.environment}-images-router-policy"
  role = aws_iam_role.pixelflow_images_router_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query",
        ]
        Resource = aws_dynamodb_table.pixelflow_main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
        ]
        Resource = [
          aws_s3_bucket.pixelflow_images.arn,
          "${aws_s3_bucket.pixelflow_images.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "pixelflow_images_router_role_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.pixelflow_images_router_role.id
}

data "aws_iam_policy_document" "pixelflow_images_router_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "pixelflow_images_router_role" {
  name = "pixelflow-${var.environment}-images-router-role"

  assume_role_policy = data.aws_iam_policy_document.pixelflow_images_router_assume_role_policy.json
}

data "archive_file" "pixelflow_images_router_lambda_zip" {
  depends_on = [null_resource.api_build]

  type        = "zip"
  source_file = "${path.module}/../api/dist/api/features/images/images-lambda.js"
  output_path = "${path.module}/../api/dist/api/features/images/images-lambda.zip"
}

resource "aws_lambda_function" "pixelflow_images_router" {
  function_name = "pixelflow-${var.environment}-images-router"
  filename      = data.archive_file.pixelflow_images_router_lambda_zip.output_path
  source_code_hash = data.archive_file.pixelflow_images_router_lambda_zip.output_base64sha256
  runtime      = "nodejs22.x"
  role         = aws_iam_role.pixelflow_images_router_role.arn
  timeout      = 30
  memory_size  = 128
  handler      = "images-lambda.handler"

  environment {
    variables = {
      S3_BUCKET_NAME     = aws_s3_bucket.pixelflow_images.bucket
      IMAGE_TABLE_NAME   = aws_dynamodb_table.pixelflow_main.name
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pixelflow_user_pool.id
      COGNITO_APP_CLIENT_ID = aws_cognito_user_pool_client.pixelflow_user_pool_client.id
    }
  }
}

resource "aws_api_gateway_deployment" "pixelflow_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.pixelflow_create_image_integration,
    aws_api_gateway_integration.pixelflow_get_images_integration,
    aws_api_gateway_method.pixelflow_create_image_method,
    aws_api_gateway_method.pixelflow_get_images_method
  ]

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.pixelflow_api.body))
  }

  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "pixelflow_api_stage" {
  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id
  deployment_id = aws_api_gateway_deployment.pixelflow_api_deployment.id
  stage_name  = var.environment
}

resource "aws_api_gateway_resource" "pixelflow_images_router" {
  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id
  parent_id   = aws_api_gateway_rest_api.pixelflow_api.root_resource_id
  path_part   = "images"
}

resource "aws_api_gateway_resource" "pixelflow_images_router_v1" {
  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id
  parent_id   = aws_api_gateway_resource.pixelflow_images_router.id
  path_part   = "v1"
}

resource "aws_api_gateway_method" "pixelflow_get_images_method" {
  rest_api_id   = aws_api_gateway_rest_api.pixelflow_api.id
  resource_id   = aws_api_gateway_resource.pixelflow_images_router_v1.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "pixelflow_create_image_method" {
  rest_api_id   = aws_api_gateway_rest_api.pixelflow_api.id
  resource_id   = aws_api_gateway_resource.pixelflow_images_router_v1.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "pixelflow_get_images_integration" {
  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id
  resource_id = aws_api_gateway_resource.pixelflow_images_router_v1.id
  http_method = aws_api_gateway_method.pixelflow_get_images_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.pixelflow_images_router.invoke_arn

  depends_on = [
    aws_lambda_permission.pixelflow_image_router_permission,
    aws_lambda_function.pixelflow_images_router,
    aws_api_gateway_method.pixelflow_get_images_method,
  ]
}

resource "aws_api_gateway_integration" "pixelflow_create_image_integration" {
  rest_api_id = aws_api_gateway_rest_api.pixelflow_api.id
  resource_id = aws_api_gateway_resource.pixelflow_images_router_v1.id
  http_method = aws_api_gateway_method.pixelflow_create_image_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.pixelflow_images_router.invoke_arn

  depends_on = [
    aws_lambda_permission.pixelflow_image_router_permission,
    aws_lambda_function.pixelflow_images_router,
    aws_api_gateway_method.pixelflow_create_image_method,
  ]
}

resource "aws_lambda_permission" "pixelflow_image_router_permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pixelflow_images_router.arn
  principal     = "apigateway.amazonaws.com"

  # source_arn = "${aws_api_gateway_rest_api.pixelflow_api.execution_arn}/${var.environment}/images"
  source_arn = "${aws_api_gateway_rest_api.pixelflow_api.execution_arn}/*"
}