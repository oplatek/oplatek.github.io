---
layout: post
title: Visualisation of blame 
author: Ondrej Platek
tags: Neural networks, visualisation, ideas
---

I sometimes want to blame something or somebody else for errors.

This time I want to blame the **inputs** of **neural network** for its **bad prediction**.

The key idea is simple:

1. Imagine you have build and trained a neural network with a last layer representing $$ P(y \mid x) $$ distribution for each input $$ x $$. 
2. Suppose that for $$ x_k $$ input of the neural network predicts $$ y_k \mid y_k \neq \hat{y_k} $$ which is not equal to known truth $$ \hat{y_k} $$
3. You are am not satisfied. 
    - I blame the neural network: what the hell the neural network thinks which input should be different so it would predict the correct input?
4. Let's start to compute the "*blame*":
    1. Compute the expected $$ E_{x \in X}(P(y \mid x)) $$ distribution over your set $$ X $$
    2. Compute gradients of the NN from the loss function $$ \nabla E_{x \in X}(P(y \mid x)) - P(\hat{y_k} \mid x_k) $$ 
    3. For each member $$ x_{k,i} $$ of input vector $$ x_k $$ compute (symbolic) gradients $$ \sum_{j \in \mid hidden \mid}{\nabla W^k_{i,j}} $$
    4. Find the member $$ i \in \{1, ..., \mid x_k \mid \} $$ with the "largest gradient"
        - There are two solutions how to deal with symbolic gradients:
            - Perform a single step in gradient descent i.e. fill in the missing variables
            - Since all the weights should have the same symbolic variables, divide all the weights with all the symbolic variables and just use the coefficients

**Please let me know what you think about the proposal!**

I want to code it up soon, so please let me your opinions.
Before that I have some todos: 

1. *Consider your feedback.*
2. *Read more about contrastive estimation - which as I learned basically described above. I bet Mr Hinton have some notes on this.*
3. *Explore if someone else did something similar.*
4. *What if I will sample the inputs given the golden label $$ \hat{y} $$?*
