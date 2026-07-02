---
layout: post
title: Starting with LLM? Think hard, start small, iterate fast. Time is all you need.
author: Ondrej Platek
tags: LLM, research, Math, Education, BottleCap AI, nanoGPT, pretraining, RL, getting started
---

David — who literally helped make [SpaceX](https://www.linkedin.com/in/davidpav/) rockets fly — asked me for a favour: _"Explain to kids from [Matika Cesku](https://www.linkedin.com/company/matika-cesku/) what BottleCap AI does and what you do as an LLM researcher, in plain words."_ I was hooked. Immediately. I'm a fan.

I'm a fan of Mathematics, Teaching and, of course, LLM research.
Here are my resources, and they double as my updated recommendation for **any motivated person who wants to start LLM research today.** 🚀

## My personal advice 

- **Hard empirical evidence is the key.** Math and logic give you the intuition; the experiments tell you whether your intuition was right. You need hundreds of experiments. Have hundreds of different reality checks instead of three. Quantity of valid experiments matters.
- **To go fast, start small.** As a beginner you have almost no hardware, which forces you to **spend your thinking on the most interesting parts** instead of babysitting a giant run. Use it to your advantage and trust that it scales. Spend most time at designing experiments to give you the most informative and conclusive findings.
- **Finally, when you trust your improvements** it is time to scale. Find a place that will scale your research. I found BottleCap AI.

<details markdown="1">
<summary><strong>New to LLMs? Short dictionary and intro to research :)</strong></summary>

Let's break it down:

- LLM - large language model -- as of 2026 a variant of Transformer neural network architecture with typically billions or trillions number of parameters.
- LLMs are capable of solving hard math problems, are superior in coding to humans, are good compressors of information and remembers almost the whole textual Internet. However, recalling it exactly is a problem for the model sometimes. They hallucinate.
- Training an LLM is costly and building the largest LLMs cost billions of dollars for a single checkpoint.
- Running the inference at scale and supporting millions of users is even more expensive.
- TL;DR today's LLMs are an engineering marvel as much as a product of many research ideas. 

### What is a research
For simplicity I will assume it is a process, where you collect findings by running experiments.

What is an experiment? It is a process where you:

1. Formulate a hypothesis:typically something well defined and narrow so you can compare it to existing baseline. E.g.
   does more data collected a particular way e.g. in dataset XYZ improve training of our model M?
2. Implement it in code, run it. This time the example experiment is about training  which has clear objective function.
3. Finally you evaluate how your objective improved. You think about whether you did the experiment correctly, what it means in
   practice.
4. Finally, you repeat the process. Because you need thousands of these micro decisions and without them you have no
   knowledge and people tend to have pretty bad intuition about the experiment outcome.

</details>

## Two parts: pretraining and post-training

If you remember one thing about how modern LLMs are built, remember that there are **two main parts**, and they have completely different flavours.

### 1. Pretraining — the math-motivated part

This is where the model learns to predict the next token over a huge pile of text.
The objective is rooted in an elegant field of information theory: language modeling is literally just minimizing **cross-entropy**.

Good news for beginners: **pretraining algorithm can be developed efficiently on small scale.**
This is exactly where the 20-minute loop lives. See modded-nanogpt link below.

### 2. Post-training — the hacky part

This is where the model learns to be _useful_ — to follow instructions, to reason, to behave. It follows the **theory of reinforcement learning**, but in practice it is far more **hacky and empirical** than pretraining. These days it is crazy expensive, it needs model of few billion parameters to work well and the pre-training phase done right. I do not know how to scale it down, so I advise you to stay away. I will be happy if you prove me wrong!

## Resources overview

Here is the learning path I have recommended many times.

### The pre-training ninja path

**Build the foundations with Andrej Karpathy.** My favourite intro to neural networks and then to LLMs, full stop:

- ▶️ [Karpathy — Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ)

**Understand the architecture that started it all.** The paper of the century — _Attention Is All You Need_ — explained very nicely by another hero, Yannic Kilcher:

- ▶️ [Yannic Kilcher — the Transformer paper](https://youtu.be/iDulhoQ2pro?si=ASXAk6Gjgc7uhWDv)

**Get your hands dirty.** A great hands-on start, small enough to run and iterate fast:

- 💻 [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)

**Then chase speed.** There is an ultra-fast fork that turns training into a sport:

- ⚡ [KellerJordan/modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt)

…and that speed-running culture is literally our entrance hiring test at BottleCap AI:

- 🧪 [BottleCapAI/NoCap-Test](https://github.com/BottleCapAI/NoCap-Test) — **feel free to try it.** 

## Where to actually run it — for free or nearly free

Remember the whole point: **no GPU at home does not stop you.** You are able to execute many 20-minute loops without buying any hardware.

**Free notebooks with a GPU attached:**

- 📓 [Google Colab](https://colab.research.google.com/) — free GPU runtimes, zero setup, perfect for your first nanoGPT run.
- 📓 [Kaggle Notebooks](https://www.kaggle.com/code) — free weekly GPU/TPU quota and a generous community.
- 🤗 [Hugging Face Spaces](https://huggingface.co/spaces) — host and share your model and demos; literally showcases of the newest science.

### Living on the edge with RL trained models

_To inspect capabilities or get great (coding) advisors you can use inference engines cheaply.
You can even power your own agent almost for free and hack it to your needs. Just mind sharing your private data and
take the advice with a grain of salt._

**Cheap hosted inference (when you just want to _use_ a model, not train one):**

- 🟢 [NVIDIA build (NIM APIs)](https://build.nvidia.com/) — a large catalogue of models behind a very cheap inference API, with free credits to get going.
- 🔀 [OpenRouter](https://openrouter.ai/) — one API key, hundreds of models, pay-as-you-go. Great for comparing models without juggling accounts.


- 🤖 [Pi coding agent](https://pi.dev/) ([source](https://github.com/badlogic/pi-mono)) — a minimal, fully hackable terminal agent you extend in TypeScript.
- 🤖 [OpenCode](https://opencode.ai/) — open-source terminal coding agent that works with 75+ providers (including OpenRouter above).

Pick one, point it at your nanoGPT checkout, and let it handle the boilerplate while you think about the interesting parts.

### Reinforcement Learning theory

For reinforcement learning, I do not know of any practical setup that directly scales to SOTA research, so I can only recommend two resources:
- Nice but very general introduction to Reinforcement Learning by [Sutton & Barto: Introduction to Reinforcement Learning](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf),
- [Sebastian Raschka's blog about LLMs](https://sebastianraschka.com/blog/) — lately, all published models were trained by an algorithm at least inspired by reinforcement learning.
- [Sebastian Raschka exercise for a book Build A Reasoning Model (From
Scratch)](https://github.com/rasbt/reasoning-from-scratch) is good intro to creating useful reasoning model training.
However, it must be opinionated and you need serious infra for the experiments. The [source code](https://github.com/rasbt/reasoning-from-scratch) contains good reference implementation.


## Wrap up 

To conclude: start small, go fast, and let the empirical evidence sharpen your intuition.
And if you're stuck, reach out to people — or Claude Code, or Codex.
The best coding agents today.
Most importantly, have fun with fellow humans.

[Reach out — let's research LLMs together. As a human, I need fun projects :) ➔](https://www.linkedin.com/in/ondrejplatek/)

### Last but not least: what does BottleCap do?
_The very first question I was asked today._

We are working hard on speedups for training as well as inference.
We also ship products:

- 🔎 [**AI Scan**](https://scan.bottlecapai.com/) — _AI models are manipulated. We reveal how._ It detects post-training modifications — opinion steering, topic avoidance, sensitivity filters — and lets you compare shift-evaluation reports across 25+ models. A perfect playground for the "post-training is hacky" lesson above.
- 📱 [**Pulse**](https://www.bottlecapai.com/pulse-app) — community news powered by our own efficiency-first model CAP1. Cut signal from noise in real time. Grab it on [iOS](https://apps.apple.com/us/app/id6753948492) or [Android](https://play.google.com/store/apps/details?id=com.bottlecapai.pulse).
- 🧪 We hire smart engineers and have fun. Improve LLM pretraining and join us! **[try the BottleCapAI/NoCap-Test](https://github.com/BottleCapAI/NoCap-Test)**.
