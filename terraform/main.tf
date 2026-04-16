resource "aws_key_pair" "tf-key" {
  key_name   = "tf-key"
  public_key = file(var.aws_key_pair_destination)
}

# VPC
resource "aws_vpc" "my_vpc" {
  cidr_block       = "10.0.0.0/16"
  instance_tenancy = "default"
}

# Subnets
resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.my_vpc.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_subnet" {
  vpc_id     = aws_vpc.my_vpc.id
  cidr_block = "10.0.2.0/24"
}

# Internet Gateway
resource "aws_internet_gateway" "my-ig" {
  vpc_id = aws_vpc.my_vpc.id
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat-eip" {
  domain   = "vpc"
}

# NAT Gateway
resource "aws_nat_gateway" "my-ng" {
  allocation_id = aws_eip.nat-eip.id
  subnet_id     = aws_subnet.private_subnet.id
}

# Route Tables
resource "aws_route_table" "public-rt" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.my-ig.id
  }
}

resource "aws_route_table" "private-rt" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.my-ng.id
  }
}

resource "aws_route_table_association" "public-rt-association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public-rt.id
}

resource "aws_route_table_association" "private-rt-association" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private-rt.id
}