# GRPO — Group Relative Policy Optimization

id: grpo
version: 2
summary: Shao et al., 2024 (DeepSeekMath) and DeepSeek-R1. Critic-free PPO with group-normalized advantages — objective, KL estimator, supervision types, findings, and the fixes (Dr. GRPO, DAPO, GSPO).
source: https://arxiv.org/abs/2402.03300

### grpo-001 | basics
Q: What is GRPO, in one sentence?
A: A PPO variant that **drops the value (critic) model**: for each prompt it samples a group of G responses, scores them, and uses each response's reward *relative to the group* as its advantage.
N: Shao et al. (2024), "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models", arXiv 2402.03300. Later the RL algorithm behind DeepSeek-R1.

### grpo-002 | advantage
Q: How does GRPO compute the advantage with outcome rewards?
A:
```
Â_{i,t} = r̃_i = ( r_i − mean(r) ) / std(r)
r = (r_1, …, r_G)
```
Every token t of response i gets the same advantage: the response's z-scored reward within its group.

### grpo-003 | motivation
Q: Why drop PPO's critic? (two reasons from the paper)
A:
- The value model is typically about as large as the policy → a big **memory and compute** burden.
- The reward model scores only the **last token**, so training a value function that is accurate at every token is hard.
The group mean is a cheap baseline instead.

### grpo-004 | objective
Q: Write the GRPO objective.
A:
```
J(θ) = E[ (1/G) Σ_i (1/|o_i|) Σ_t {
    min( ρ_{i,t}·Â_{i,t},
         clip(ρ_{i,t}, 1−ε, 1+ε)·Â_{i,t} )
    − β · D_KL[ π_θ ‖ π_ref ] } ]

ρ_{i,t} = π_θ(o_{i,t} | q, o_{i,<t})
        / π_old(o_{i,t} | q, o_{i,<t})
```
PPO's clipped surrogate, averaged over tokens and group members, minus a KL penalty. Outputs {o_i} are sampled from π_old for question q.

### grpo-005 | objective, kl
Q: Where does GRPO put the KL penalty, compared with InstructGPT-style PPO?
A: **Directly in the loss** (the −β·D_KL term), instead of subtracting a per-token KL penalty from the reward. This keeps the advantage computation simple.

### grpo-006 | kl
Q: Which KL estimator does GRPO use?
A:
```
D_KL ≈ π_ref(o_t|·) / π_θ(o_t|·)
     − log( π_ref(o_t|·) / π_θ(o_t|·) )
     − 1
```
Schulman's "k3" estimator, computed per token: unbiased and always ≥ 0.

### grpo-007 | kl
Q: Why is GRPO's KL estimate never negative?
A: With x = π_ref/π_θ > 0 it equals **x − log x − 1**, and log x ≤ x − 1 for every x > 0 (equality only at x = 1).

### grpo-008 | hyperparameters
Q: What do G, ε and β mean in GRPO?
A:
- **G** — group size: responses sampled per prompt
- **ε** — PPO clip range for the probability ratio
- **β** — coefficient of the KL penalty toward π_ref

### grpo-009 | hyperparameters, paper
Q: DeepSeekMath's GRPO hyperparameters?
A: Policy LR **1e-6**, KL coefficient **β = 0.04**, **G = 64** samples per question, max length 1024, batch size 1024, a **single policy update** per exploration stage.
N: RL data: ~144K chain-of-thought questions related to GSM8K and MATH, taken from the SFT data.

### grpo-010 | advantage, failure-modes
Q: What happens to a prompt where all G responses get the same reward?
A: Every advantage is **0** (r_i − mean = 0), so the prompt gives no policy-gradient signal — only the KL term acts. Prompts that are always solved or never solved are wasted rollouts.
N: DAPO's Dynamic Sampling filters out groups with accuracy 0 or 1 and keeps sampling until the batch is full of informative groups.

### grpo-011 | advantage
Q: What does the group mean play the role of in GRPO?
A: The **baseline** for variance reduction — replacing PPO's learned value function. Dividing by the group std additionally rescales the advantages per prompt.

### grpo-012 | objective
Q: With a single gradient step per batch of samples (π_old = π_θ), what does the GRPO gradient reduce to?
A: The ratio is 1 and clipping never triggers, so it is **REINFORCE with a group-mean baseline** (plus the KL term):
```
∇J ∝ Σ_i (1/|o_i|) Σ_t Â_i
       · ∇log π_θ(o_{i,t} | q, o_{i,<t})
```
N: Clipping only matters when the same samples are reused for several updates.

### grpo-013 | supervision
Q: Outcome supervision vs process supervision?
A:
- **Outcome**: one reward for the final result of the whole response.
- **Process**: a reward for each intermediate reasoning step, from a process reward model.

### grpo-014 | supervision, advantage
Q: How is the GRPO advantage computed with process supervision?
A: Normalize all step rewards in the group (mean/std over every step of every output), then each token's advantage is the **sum of the normalized rewards of the steps at or after it**:
```
Â_{i,t} = Σ_{index(j) ≥ t} r̃_i^{index(j)}
```
N: In DeepSeekMath, GRPO + process supervision beat GRPO + outcome supervision.

### grpo-015 | advantage, failure-modes
Q: The outcome advantage is identical for every token of a response. Consequence?
A: Coarse **credit assignment**: every token of a correct answer is reinforced and every token of a wrong answer is penalized equally — including good steps inside a wrong answer. Process supervision is one fix.

### grpo-016 | paper
Q: What is "iterative RL" in DeepSeekMath?
A: Periodically **retrain the reward model** on samples from the current policy (with a replay of 10% historical data), then continue training the policy with the updated RM — so the RM keeps up with the shifting policy.

### grpo-017 | paper
Q: What did GRPO achieve in DeepSeekMath?
A: DeepSeekMath-Instruct 7B → DeepSeekMath-RL 7B: **GSM8K 82.9% → 88.2%**, **MATH 46.8% → 51.7%**.

### grpo-018 | paper, insight
Q: DeepSeekMath: how did RL change Pass@K vs Maj@K?
A: RL improved **Maj@K** (majority voting) but **not Pass@K**. The authors read this as RL making the output distribution more robust — boosting correct answers already among the top-K — rather than adding fundamentally new capability.

### grpo-019 | paper, insight
Q: DeepSeekMath's "unified paradigm" describes SFT, RFT, DPO, PPO and GRPO with which three components?
A:
- **Data source** — offline dataset or online samples from the policy
- **Reward function** — rules or a model
- **Algorithm** — turns them into a gradient coefficient GC that scales ∇log π_θ(o_t | q, o_<t)

### grpo-020 | paper, insight
Q: GRPO's gradient coefficient in the unified paradigm?
A:
```
GC = Â_{i,t}
   + β · ( π_ref(o_{i,t}|o_{i,<t})
         / π_θ(o_{i,t}|o_{i,<t}) − 1 )
```
The advantage, plus the gradient of the k3 KL estimate pulling toward π_ref.

### grpo-021 | paper, insight
Q: DeepSeekMath: how did offline RFT, online RFT and GRPO compare?
A: **Online RFT > offline RFT** (sampling from the current policy matters), and **GRPO > online RFT** — GRPO uses reward magnitudes and actively penalizes bad answers, instead of only fine-tuning on the correct ones.

### grpo-022 | r1
Q: DeepSeek-R1-Zero: what rewards did GRPO optimize?
A: Only **rule-based** rewards:
- Accuracy reward — e.g. check the final boxed answer, run test cases for code
- Format reward — reasoning inside `<think>…</think>` tags
No neural reward model: the authors found it prone to reward hacking in large-scale RL.

### grpo-023 | r1
Q: What emerged when R1-Zero ran pure GRPO on a base model (no SFT)?
A: Ever-longer chains of thought, reflection and self-verification (the "aha moment"), and AIME 2024 pass@1 rising from **15.6% to 71.0%** (86.7% with majority voting).
Downsides: poor readability and language mixing → R1 adds a cold-start SFT stage.
N: The revised version of the R1 paper reports 77.9% pass@1 for the final R1-Zero checkpoint.

### grpo-024 | r1, hyperparameters
Q: DeepSeek-R1-Zero's GRPO hyperparameters?
A: LR **3e-6**, KL coefficient **0.001**, **G = 16** samples per question, max length 32,768 tokens (65,536 later in training).
N: Compare DeepSeekMath: β = 0.04, G = 64, max length 1024 — far longer rollouts, far weaker KL leash.

### grpo-025 | r1
Q: What is RLVR, and why does GRPO fit it so well?
A: **RL with Verifiable Rewards**: rewards come from programmatic checks (exact-match math answers, unit tests). GRPO needs only one scalar score per sampled response — no critic, no per-token reward — so a cheap verifier is enough.

### grpo-026 | variants, failure-modes
Q: Dr. GRPO: which two biases in GRPO does it identify, and what is the fix?
A:
- **Response-length bias** from 1/|o_i|: a long wrong answer is penalized less per token, so incorrect responses keep growing.
- **Question-difficulty bias** from ÷std(r): prompts with low reward variance (almost all right or all wrong) get up-weighted.
Fix: remove both normalizations.
N: Liu et al. (2025), "Understanding R1-Zero-Like Training: A Critical Perspective".

### grpo-027 | variants
Q: DAPO: name its four techniques.
A:
- **Clip-Higher** — decoupled ε_low = 0.2, ε_high = 0.28
- **Dynamic Sampling** — drop groups with accuracy 0 or 1
- **Token-Level Policy Gradient Loss**
- **Overlong Reward Shaping** — handle truncated responses
It also drops the KL penalty.
N: "DAPO: An Open-Source LLM Reinforcement Learning System at Scale" (2025): 50 points on AIME 2024 with Qwen2.5-32B base.

### grpo-028 | variants, failure-modes
Q: Why does DAPO raise the upper clip bound ("Clip-Higher")?
A: With a symmetric ε, a low-probability token can only grow a little per update (ratio ≤ 1+ε), so exploratory tokens stay rare and **entropy collapses**. A larger ε_high lets rare good tokens gain probability.

### grpo-029 | variants
Q: Sample-level vs token-level loss averaging?
A:
- **GRPO (sample-level)**: average tokens within each response, then average responses → every response weighs the same, so each token of a long response counts less.
- **DAPO (token-level)**: average over all tokens in the batch → every token counts equally, so long bad responses are penalized in full.

### grpo-030 | variants
Q: GSPO: what changes compared with GRPO?
A: A **sequence-level**, length-normalized importance ratio, with clipping applied to whole responses instead of tokens:
```
s_i(θ) = ( π_θ(y_i|x) / π_old(y_i|x) )
         ^ (1/|y_i|)
```
Motivation: stabler RL, especially for Mixture-of-Experts models.
N: Zheng et al. (2025), "Group Sequence Policy Optimization" (Qwen).

### grpo-031 | advantage, variants
Q: How does GRPO's baseline differ from RLOO's?
A: **RLOO** uses the mean of the *other* k−1 samples (leave-one-out) and does not divide by std. **GRPO** uses the mean of the whole group, the sample itself included, and divides by the group std.

### grpo-032 | practice
Q: Which models are in memory: PPO-RLHF vs GRPO?
A:
- **PPO**: policy, reference, reward model, **value model**
- **GRPO**: policy, reference (if β > 0), and a reward model *or* a rule-based verifier — no value model

### grpo-033 | practice
Q: Where does most of the compute go in GRPO training?
A: **Generating the G rollouts** per prompt (autoregressive sampling of long chains of thought), not the gradient step — which is why trainers pair with fast inference engines such as vLLM.

### grpo-034 | practice, hyperparameters
Q: Trade-off in choosing the group size G?
A: Larger G → a better mean/std baseline and a better chance that a hard prompt gets a **mixed group** (some right, some wrong), i.e. a non-zero signal — at the cost of more generation compute per prompt.

### grpo-035 | objective
Q: What does ε do in the clipped objective, intuitively?
A: A cheap **trust region**: once a token's probability ratio leaves [1−ε, 1+ε] in the direction that helps the objective, its gradient is cut, so one batch of samples can't move the policy too far.
