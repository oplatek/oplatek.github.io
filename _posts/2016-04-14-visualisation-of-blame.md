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
2. Suppose that for $$ x_k $$ input vector of the neural network predicts $$ \hat{y_k} \mid \hat{y_k} \neq y_{k-gold} $$ which is not equal to known truth $$ y_k $$
3. You are am not satisfied. 
    - I blame the neural network. Which part of the input vector does the neural network need to change so it would predict the correct input?
4. Let's start to compute the "*blame*":
    1. Compute the expected $$ E_{x \in X}(P(y \mid x)) $$ distribution over your set $$ X $$
        - The expected distribution is our uninformative prior  before presenting input $$ x_k $$ but after training the network with inputs from $$ X $$.
    2. Compute gradients of the network with respect to its parameters from the loss function $$ \nabla_{\phi} E_{x \in X}(P(y \mid x)) - P(y_{k-gold} \mid x_k) $$ 
        - The difference between the expected distribution and the gold (one-hot) distribution is how surprising the gold label is.
    3. For each coordinate $$ x^i_k \mid i \in \{1, ..., \mid x_k \mid \} $$ in input vector $$ x_k $$ and corresponding true label sum the gradients computed from previous step $$ \sum_{j \in \mid FirstHidden \mid}{\nabla_{\phi} W^{i,j}_k} $$
        - Note that we are only interested in gradients on weights $$ W $$ between input and first hidden layer 
    4. Find the member $$ i \in \{1, ..., \mid x_k \mid \} $$ with the "largest gradient" to be blamed the most!
        - **Why?** Suppose that our input $$ x_k $$ consisted from words $$ w_1, w_2, w_3, ..., w_{\mid x_k \mid} $$ and $$ w_2 $$ has the "largest gradient". As a result, if I could change only one word in the input in order change the output of the network to the correct label, I would change $$ w_2 $$. Obviously, the network might still predict the same incorrect label or other incorrect label after changing one input. However, if there exist input $$ x_{artificial} $$ for which the network with parameters $$ \phi $$ predicts label $$ y_{k-gold} $$, I would start changing values of $$ x_k $$ into $$ x_{artificial} $$ according the order "gradients" on the input from step 3.

**Please let me know what you think about the proposal!**

I want to code it up soon, so please let me your opinions.
Before that I have some todos: 

1. *Consider your feedback.*
2. *Read more about contrastive estimation - which as I learned basically described above. I bet Mr Hinton have some notes on this.*
3. *Explore if someone else did something similar.*
4. *How can I use samples from inputs distribution given the golden label $$ y_{k-gold} $$, the parameters $$ \phi $$ and the expected distribution $$ E_{x \in X}(P(y \mid x)) $$?*

Notes & Questions
-----------------

#### In step 4 the sum $$ \sum_{j \in \mid hidden \mid}{\nabla_{\phi} W^k_{i,j}} $$ is not a real number but a symbolic expression 
There are two solutions how to deal with symbolic gradients and convert them to real numbers in our situation:

- Perform a single step in gradient descent i.e. fill in the missing variables
- Since all the weights should have the same symbolic variables, divide all the weights with all the symbolic variables and just use the coefficients
