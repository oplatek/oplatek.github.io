# DPO vs GRPO

id: dpo-vs-grpo
version: 2
summary: Side-by-side questions that force you to tell the two apart — signal, data, models, β, cost, failure modes, and when to use which.

### cmp-001 | compare
Q: DPO vs GRPO: what learning signal does each need?
A:
- **DPO**: pairwise preferences (x, y_w, y_l) — "which answer is better".
- **GRPO**: a scalar reward for each sampled response — from a verifier/rule or a reward model.

### cmp-002 | compare
Q: DPO vs GRPO: online or offline?
A:
- **DPO**: offline — a fixed dataset, no sampling inside the training loop.
- **GRPO**: online — samples a fresh group of G responses from the current policy for every prompt, every step.

### cmp-003 | compare
Q: DPO vs GRPO: is there a reward model? a critic?
A:
- **DPO**: no reward model — the reward is implicit, r̂ = β·log π_θ/π_ref. No critic.
- **GRPO**: an explicit reward (rule-based verifier or trained RM), but **no critic/value model**.

### cmp-004 | compare, hyperparameters
Q: What does β mean in DPO vs in GRPO?
A: In both: the strength of the pull toward π_ref.
- **DPO**: scales the implicit reward inside the sigmoid; the KL constraint is implicit (typical 0.1).
- **GRPO**: explicit coefficient on the k3 KL penalty in the loss (0.04 in DeepSeekMath, 0.001 in R1-Zero; DAPO drops it).

### cmp-005 | compare
Q: What is each method's "comparison point" (baseline)?
A:
- **DPO**: the rejected response y_l — a pairwise contrast.
- **GRPO**: the mean reward of the G samples for the same prompt.
Both learn from **relative**, not absolute, quality.

### cmp-006 | compare, practice
Q: When would you pick DPO over GRPO?
A: When you have (or can cheaply collect) **preference pairs** for fuzzy qualities — helpfulness, tone, safety — and want a cheap, stable, offline step with no generation in the loop.

### cmp-007 | compare, practice
Q: When would you pick GRPO over DPO?
A: When correctness can be **checked automatically** (math answers, unit tests, output formats) and you want the model to discover better reasoning by exploring its own samples — e.g. R1-style reasoning training.

### cmp-008 | compare, failure-modes
Q: Typical failure modes: DPO vs GRPO?
A:
- **DPO**: overfitting near-deterministic preferences, the chosen response's likelihood dropping, verbosity, off-policy distribution shift.
- **GRPO**: hacking a weak verifier/RM, entropy collapse, zero-signal groups (all right / all wrong), length bias, expensive rollouts.

### cmp-009 | compare, practice
Q: Compute per training step: DPO vs GRPO?
A:
- **DPO**: forward/backward on 2 responses per prompt (+ a reference forward, which can be precomputed) — roughly SFT × 2.
- **GRPO**: first generate G full responses per prompt, then score and update — generation usually dominates.

### cmp-010 | compare, paper
Q: How do DPO and GRPO look in DeepSeekMath's unified paradigm?
A:
- **DPO**: offline data from the SFT model; gradient coefficient σ(β·log π/π_ref(y_l) − β·log π/π_ref(y_w)) — positive on y_w, negative on y_l.
- **GRPO**: online data from the current policy, reward from a model or rules; GC = Â_{i,t} + β(π_ref/π_θ − 1).

### cmp-011 | compare, history
Q: The PPO-RLHF pipeline that both methods simplify — its three stages, and what each method removes?
A:
1. SFT
2. Train a reward model on preference pairs (Bradley–Terry)
3. PPO against the RM with a KL penalty, using a learned value function
**DPO** collapses 2 + 3 into one supervised loss. **GRPO** keeps 3 but drops the value function.

### cmp-012 | compare
Q: Which family does each method belong to?
A:
- **DPO**: preference optimization — a contrastive, classification-style loss; no RL loop.
- **GRPO**: policy-gradient RL — PPO family, critic-free.

### cmp-013 | compare, history
Q: DeepSeek-R1's training pipeline — where does GRPO sit?
A: Cold-start SFT → **reasoning-oriented RL (GRPO)** → rejection sampling + SFT → **RL for all scenarios (GRPO)**, with rule-based rewards for reasoning and reward models for general helpfulness/harmlessness.
