---
layout: post
title: What to setup first on AWS?
author: Ondrej Platek
tags: AWS, automation
---

### What to setup first?
is the most important question.
AWS is useful, well documented but overwhelming.

Let me introduce my strategy.

#### Billing alerts
 There is always danger of accidentally spending money.
 [Set up alerts may prevent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html#turning_on_billing_metrics)
  - overstepping a planned budget,
  - ignoring increased usage of your service,
  - keeping useless resources deployed.
 If not setup one is able to spend a fortune on unfitting infrastructure.

#### Setup logging
If you never experienced random, rare, hard to replicate bugs, you are lucky. For the rest of us is logging the crucial tool examine behaviour over long period of time and across many deployments and devices.

[*CloudWatch*](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) is very easy to integrate and archive, but it lacks more advanced features.
Luckily, there is a plenty of tools which can analyze, filter and monitor logs and provide much prettier and efficient interface.
Often they easily integrate with Cloudwatch which or can be used directly.
I would like to mention two of them:
- [Rapid7 InsightIps](https://www.rapid7.com/products/insight-platform/) for easy to use filters and setting up event notifications. Plus I like their UI.
- [Loggly](https://www.loggly.com/) excels with their query language for the logs where you can query across different source of log streams with common value e.g. time stamps.

#### Infrastructure as a code (IaC)
There has been written a lot about IaC, and rightly so.
I recommend following posts and videos to check:
 - [AWS cli vs Terraform](https://www.stratoscale.com/blog/datacenter/choosing-the-right-provisioning-tool-terraform-vs-aws-cloudformation/)
 - [Amazing Scalable Terraform Development for Teams Talk](https://www.youtube.com/watch?v=wgzgVm7Sqlk&t=3s)

However, I would like to make another point.
*IaC* is also so awesome because it is an alternative view on the deployment.
One type of documentation already exists. This is the default AWS documentation.
The form is well known; Click on resource XY (or use this http request). Select this parameter. Wait few minutes and continue by deploying resource YZ.
The typical procedural view.

*IaC* brings completely different and more concise documentation. It runs along: Declare resource XY and where you have to provide this parameters, and there another three completely optional parameters.
Such documentation is concise and offers more high-level overview.
I find it much easier to read.

Typically, I read first Terraform documentation to learn the high-level concepts, and later to understand it more deeply I study the AWS documentation directly.
It is very refreshing.
In addition, IaC and open-source development offers a lot of examples and resource to learn from.

I really enjoy combining the tools for debugging: Terraform plan & deploy commands are the commands where I discover the bugs. The AWS cli often helps me analyze the problemms, but returning to gold old fashion web browser and AWS console gives me alternative view where it is often on the first sight obvious what is wrong.

### List of services which
- EC2
    - renting machines
    - autoscaling groups - which can automatically scale based on traffic
- ALB or ELB - load balancers
- ECR - hosted docker container registry
- ECS/Fargate - hosted containers on demand. I have only a little experience with Fargate, but it works like magic.
- CloudWatch - basic tool to collect, display and monitor logs.
- S3 - object storage
- Route 53 - managed DNS service (cool with Terraform even for small a lot of small websites)
