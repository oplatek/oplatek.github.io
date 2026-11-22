# DPO — Direct Preference Optimization

id: dpo
version: 2
summary: Rafailov et al., 2023. Preference alignment without RL — derivation, loss, gradient, practice, and the variants (IPO, cDPO, SimPO, ORPO, KTO).
source: https://arxiv.org/abs/2305.18290

### dpo-001 | basics
Q: What does DPO do, in one sentence?
A: It aligns a language model to preferences **without reinforcement learning**: it optimizes the same KL-constrained reward objective as RLHF, but with a simple classification-style loss on preference pairs — no reward model, no sampling, no PPO.
N: Rafailov, Sharma, Mitchell, Ermon, Manning, Finn (2023), "Direct Preference Optimization: Your Language Model is Secretly a Reward Model", arXiv 2305.18290.

### dpo-002 | basics, data
Q: What does one DPO training example look like?
A: A triple **(x, y_w, y_l)**:
- x — the prompt
- y_w — the preferred ("chosen", winning) response
- y_l — the dispreferred ("rejected", losing) response
N: Typically: sample the SFT model twice per prompt and ask humans (or an AI judge) which answer is better.

### dpo-003 | derivation
Q: Write the RLHF objective that DPO starts from.
A:
```
max_π  E_{x~D, y~π(·|x)} [ r(x,y) ]
       − β · KL( π(·|x) ‖ π_ref(·|x) )
```
Maximize reward, but stay close to the reference (SFT) policy. β is the strength of the KL leash.

### dpo-004 | derivation
Q: What is the closed-form optimal policy of the KL-constrained reward objective?
A:
```
π*(y|x) = (1/Z(x)) · π_ref(y|x)
                   · exp( r(x,y) / β )
```
The reference policy, reweighted by exponentiated reward.
N: Z(x) = Σ_y π_ref(y|x) · exp(r(x,y)/β) is the partition function.

### dpo-005 | derivation
Q: Why can't you just sample from the closed-form optimal policy π* directly?
A: Its normalizer **Z(x)** sums over *every possible response y* — intractable for language. DPO's trick is to make Z(x) cancel.

### dpo-006 | derivation
Q: Derivation step: how does max E[r] − β·KL(π‖π_ref) become a KL to π*?
A:
```
E_π[r] − β·KL(π ‖ π_ref)
    = −β · [ KL(π ‖ π*) − log Z(x) ]
```
Z(x) doesn't depend on π, so the objective is maximized exactly at π = π* (KL ≥ 0, zero only when equal).

### dpo-007 | derivation
Q: The key DPO reparameterization: write the reward in terms of the optimal policy.
A:
```
r(x,y) = β · log( π*(y|x) / π_ref(y|x) )
       + β · log Z(x)
```
Take the log of the optimal-policy formula and solve for r.

### dpo-008 | derivation, preference-models
Q: Bradley–Terry model: the probability that y_w is preferred to y_l?
A:
```
p(y_w ≻ y_l | x)
    = σ( r(x,y_w) − r(x,y_l) )
```
Only the **difference** of rewards matters (σ = logistic sigmoid).

### dpo-009 | derivation
Q: Why does the partition function Z(x) disappear from the DPO loss?
A: Bradley–Terry uses only the reward difference r(x,y_w) − r(x,y_l). Both rewards contain the same **β·log Z(x)** term (same prompt x), so it cancels.

### dpo-010 | loss
Q: Write the DPO loss.
A:
```
L_DPO = −E_{(x,y_w,y_l)~D} [ log σ(
    β·log( π_θ(y_w|x) / π_ref(y_w|x) )
  − β·log( π_θ(y_l|x) / π_ref(y_l|x) ) ) ]
```
Logistic (binary cross-entropy) loss on the difference of implicit rewards.

### dpo-011 | loss
Q: What is DPO's **implicit reward**?
A:
```
r̂_θ(x,y) = β·log( π_θ(y|x) / π_ref(y|x) )
```
Hence the paper's subtitle: "Your language model is secretly a reward model."

### dpo-012 | loss, practice
Q: What is the DPO loss at step 0, when π_θ = π_ref?
A: **log 2 ≈ 0.693.** Both log-ratios are 0, so the margin is 0 and −log σ(0) = log 2.
N: A handy sanity check: if the first logged loss is not ≈0.693, the reference model or the token masking is probably wrong.

### dpo-013 | gradient
Q: Write the DPO gradient.
A:
```
∇_θ L = −β · E[ σ( r̂(x,y_l) − r̂(x,y_w) )
    · ( ∇log π_θ(y_w|x)
      − ∇log π_θ(y_l|x) ) ]
```
Push up y_w, push down y_l — weighted by how wrong the implicit reward currently is.

### dpo-014 | gradient
Q: What does the weight σ(r̂(x,y_l) − r̂(x,y_w)) in the DPO gradient do?
A: It is **large when the model ranks the pair wrongly** (r̂_l > r̂_w) and small when it already ranks it right with a margin — so pairs that are already solved stop contributing.
N: The paper notes that a naive version without this weighting can cause the language model to degenerate.

### dpo-015 | hyperparameters
Q: What does β control in DPO?
A: How strongly the policy is tied to π_ref. **Larger β → stays closer to the reference**; smaller β → drifts further to fit the preferences. β also scales the implicit reward inside the sigmoid.
N: Paper default β = 0.1 (β = 0.5 for TL;DR summarization).

### dpo-016 | practice
Q: Which models does DPO need during training — and which does it *not* need?
A: Needs: the trainable policy **π_θ** and a frozen reference **π_ref** (usually the SFT model).
Not needed: a reward model, a value/critic model, or sampling from the policy.
N: π_ref's log-probs on the dataset can be precomputed once, so only one model must sit in GPU memory while training.

### dpo-017 | practice
Q: How is log π_θ(y|x) computed for a whole response in practice?
A: The **sum** of per-token log-probabilities over the **response tokens only** (prompt and padding masked out), with teacher forcing.
N: A sum, not a mean — so long responses have larger-magnitude log-probs. SimPO switches to the mean.

### dpo-018 | practice, data
Q: Which model should π_ref be, and what if you don't have it?
A: Ideally the SFT model that produced the preference data. If it isn't available, first fine-tune on the preferred completions y_w (**"Preferred-FT"**) and use that as π_ref — this reduces the distribution shift between π_ref and the data.

### dpo-019 | basics
Q: Is DPO online or offline?
A: **Offline / off-policy**: it trains on a fixed dataset of preference pairs and never samples from π_θ during training.
N: Online/iterative DPO variants re-sample from the current policy and re-label pairs every round.

### dpo-020 | theory
Q: In the DPO paper, when are two reward functions "equivalent", and why does it matter?
A: r and r′ are equivalent iff **r(x,y) − r′(x,y) = f(x)** (they differ only by a function of the prompt). Equivalent rewards give the same preference distribution (Bradley–Terry / Plackett–Luce) and the same optimal KL-constrained policy — so writing every reward as β·log π/π_ref loses no generality.

### dpo-021 | theory, preference-models
Q: How does DPO extend from pairs to full rankings of K responses?
A: Replace Bradley–Terry with the **Plackett–Luce** ranking model. The partition function still cancels, giving a DPO loss over rankings.

### dpo-022 | paper
Q: On which three tasks was DPO evaluated?
A:
- Controlled sentiment generation (IMDb)
- Summarization (Reddit TL;DR)
- Single-turn dialogue (Anthropic HH)
N: Summarization and dialogue win rates were judged by GPT-4; IMDb used a sentiment classifier as the ground-truth reward.

### dpo-023 | paper
Q: What did DPO show against PPO on IMDb sentiment generation?
A: A **better reward–KL frontier**: more reward at the same KL distance from the reference — beating PPO, even PPO trained with the ground-truth reward.

### dpo-024 | hyperparameters, paper
Q: The DPO paper's default optimization setup?
A: β = 0.1, batch size 64, RMSprop, learning rate **1e-6**, linear warmup over 150 steps.
N: Much smaller learning rates than typical SFT — a high LR quickly over-optimizes the margin.

### dpo-025 | practice, monitoring
Q: What is "reward accuracy" in DPO training logs?
A: The fraction of pairs in a batch where the implicit reward of the chosen response beats the rejected one: **r̂(x,y_w) > r̂(x,y_l)**.
N: Logs usually also show rewards/chosen, rewards/rejected and rewards/margins.

### dpo-026 | failure-modes
Q: A common surprise: what often happens to log π_θ(y_w|x) — the *chosen* response — during DPO?
A: It often **goes down** too. The loss only sees the margin, so both likelihoods can fall as long as the rejected one falls faster ("likelihood displacement"). Probability mass can move to responses that are in neither.
N: Mitigations: add an NLL/SFT term on y_w, tune β, use on-policy pairs.

### dpo-027 | failure-modes
Q: Why does DPO tend to make responses longer?
A: Preference data often favors longer answers, and the **summed** log-prob reward makes length an easy lever, so verbosity creeps up.
N: Fixes: length-normalized rewards (SimPO), explicit length regularization, length-controlled evaluation.

### dpo-028 | failure-modes, variants
Q: IPO's critique of DPO: what goes wrong with deterministic preferences?
A: If y_w is always preferred (p = 1), Bradley–Terry needs an **infinite** reward gap, so DPO pushes π(y_l) → 0 whatever β is. The KL regularization gets weaker the more deterministic the preferences — DPO overfits.
N: Azar et al. (2023), "A General Theoretical Paradigm to Understand Learning from Human Preferences" (ΨPO / IPO).

### dpo-029 | variants
Q: Write the IPO loss.
A:
```
L_IPO = E[ ( h − 1/(2τ) )² ]
h = log  π(y_w|x) · π_ref(y_l|x)
         ───────────────────────
         π(y_l|x) · π_ref(y_w|x)
```
A squared loss pulls the log-ratio margin to a **finite target** instead of pushing it to infinity.

### dpo-030 | variants
Q: What is conservative DPO (cDPO) / label smoothing?
A: Assume each preference label is flipped with probability ε. With margin m = r̂(x,y_w) − r̂(x,y_l):
```
L = −(1−ε)·log σ(m) − ε·log σ(−m)
```
The optimum now has a finite margin, which makes training robust to noisy labels.

### dpo-031 | variants
Q: SimPO in one line?
A: Reference-free DPO with a **length-normalized** reward and a target margin γ:
```
L = −log σ( (β/|y_w|)·log π_θ(y_w|x)
          − (β/|y_l|)·log π_θ(y_l|x) − γ )
```
No π_ref needed; averaging per token fights verbosity.
N: Meng et al. (2024), "SimPO: Simple Preference Optimization with a Reference-Free Reward".

### dpo-032 | variants
Q: ORPO in one line?
A: One-stage SFT + preference loss, **no reference model, no separate SFT stage**:
```
L = L_SFT(y_w) + λ · L_OR
L_OR = −log σ( log( odds(y_w|x)
                  / odds(y_l|x) ) )
odds(y|x) = P(y|x) / (1 − P(y|x))
```
N: Hong et al. (2024), "ORPO: Monolithic Preference Optimization without Reference Model".

### dpo-033 | variants
Q: KTO in one line?
A: Learns from **binary feedback** — each output simply labeled desirable or undesirable, no pairs needed — with a loss inspired by Kahneman–Tversky prospect theory (a "human-aware loss", HALO).
N: Ethayarajh et al. (2024), "KTO: Model Alignment as Prospect Theoretic Optimization". Handy for thumbs-up/down data.

### dpo-034 | variants, practice
Q: What is online / iterative DPO, and why use it?
A: Repeat: sample responses from the **current** policy → label pairs (humans, a reward model or an LLM judge) → run DPO. It removes most of vanilla DPO's off-policy distribution shift and usually trains a stronger model.
