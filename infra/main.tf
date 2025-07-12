provider "aws" {
  region = var.aws_region
  profile = var.aws_profile
}

resource "aws_s3_bucket" "pixelflow_images" {
  bucket = "pixelflow-images-${var.environment}"

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