---
layout: post
title: AplhaGo remarks 
author: Ondrej Platek
tags: Neural networks, TreeSearch, Go
---

Article can be found in [nature](http://www.nature.com/nature/journal/v529/n7587/full/nature16961.html)

How I understand some parts
- *We play games between the current policy network pρ and a randomly selected previous iteration of the policy network*
    - The same neural network NN(params_t) after training from time t play again NN(params_{sample(1...t])}

- Self training is pretty cool idea
    - Hard to apply it in dialogues 
        - no easy to compute reward
        - much harder to model user variance than just limited system responses
