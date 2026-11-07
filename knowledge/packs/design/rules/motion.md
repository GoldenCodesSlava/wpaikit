# Motion

How /generate-design decides, specifies and builds motion in Figma: hover and press states, overlays, block and hero animations. Distilled from Emil Kowalski's animation guidance, translated from code into design decisions. The design pack does not write implementation code; the motion spec below is what developers build from.

Read it before the first button set (stage 6, "Components first") and whenever an item in the cycle involves motion.

## 1. Should it animate at all?

Decide by how often a person sees it:

| Frequency | Decision | Examples |
|---|---|---|
| 100+ times a day | No animation | Keyboard shortcuts, command palette, core navigation |
| Tens of times per visit | Near-imperceptible or none: fast, small, color or opacity only | Hover on buttons, links and cards, list navigation, toggles |
| Occasional | Standard animation | Mini cart, drawers, modals, dropdowns, toasts |
| Rare or first-time | Room for a richer moment | Hero on first load, order success, empty states, onboarding |

Then name its purpose in one of these words, or do not animate:

- **Feedback**: the interface heard the user (press, add to cart).
- **Spatial consistency**: where something came from or went (a drawer slides from the edge it lives on).
- **State indication**: a state change is legible (accordion opens, button becomes "Added").
- **Preventing a jarring change**: content would otherwise jump or vanish.
- **Explanation**: motion shows how something works (marketing, onboarding).
- **Delight**: only at the rare tier.

Data a person reads or acts on (prices, totals, forms, filters) does not move for style.

## 2. Budgets

| Element | Duration |
|---|---|
| Press feedback | 100–160 ms |
| Tooltips, small popovers | 125–200 ms |
| Dropdowns, selects, option pickers | 150–250 ms |
| Modals, drawers, mini cart | 200–500 ms |
| Hover color and fill changes | 150–250 ms |
| Marketing and explanatory (hero, storytelling) | Longer is allowed |

- Interface motion stays under 300 ms unless it is a drawer or modal.
- A hero or storytelling sequence may be longer, but the primary action is visible and usable within about one second, and nothing blocks clicks while it plays.
- Exits are faster than entrances, about 20–30 % shorter.

## 3. Easing

Decision order:

| Situation | Easing |
|---|---|
| Entering or exiting | Ease-out |
| Moving or morphing on screen | Ease-in-out |
| Color or opacity change on hover | Ease |
| Constant motion (marquee, progress) | Linear |
| Anything else | Ease-out |

- Never ease-in on interface elements: it delays the moment the person is watching.
- Figma's built-in curves are weak. Use custom cubic-bezier in Smart Animate:

| Name | Curve | Use |
|---|---|---|
| `ease-out` (strong) | `0.23, 1, 0.32, 1` | Entrances, popovers, toasts |
| `ease-in-out` (strong) | `0.77, 0, 0.175, 1` | On-screen movement, morphs |
| `ease-drawer` | `0.32, 0.72, 0, 1` | Drawers, sheets, mini cart |

- Springs only for things that should feel alive, gestures a person can reverse, or decorative pointer tracking. In Figma use a gentle or custom spring with little bounce; bounce belongs to playful, rare moments only.
- Record the named curve, not "smooth", in the spec.

## 4. Shape of the motion

- **Never from nothing.** Elements appear from scale 0.95–0.97 with opacity 0, not from scale 0.
- **Origin-aware.** Popovers, dropdowns and tooltips grow from the trigger that opened them. Modals are centered and grow from the center.
- **Exit the way it entered.** A toast that enters from the bottom leaves through the bottom.
- **Press feedback.** A pressed control scales to 0.97 or darkens. If the brand forbids movement (for example "buttons do not move"), use color or an inset shadow, and record it.
- **Stagger.** Groups enter one after another with 30–80 ms between items. Stagger is decoration: it never delays the moment items become clickable.
- **Asymmetric timing.** Slow where the person decides (hold to confirm: about 2 s linear), fast where the system responds (release: about 200 ms ease-out).
- **Interruptible hover.** Hover in and out must reverse smoothly from any point. Specify hover as a transition between two states, not as a keyframe sequence.
- **Cohesion.** One motion personality per product: a crisp store is fast and quiet; a playful brand can be softer. Keep the same curves and durations for the same kinds of elements.

## 5. What can animate cheaply

Design only motion that runs smoothly in a browser:

- position, scale, rotation, opacity: free to use;
- reveals by clipping (a circle or rectangle growing, for example a fill entering from the cursor point): fine;
- height: only for accordions and expanding sections;
- blur: only small (under 20 px), for example to soften a crossfade;
- width, padding or layout changes, heavy blur, and many simultaneous moving photos: avoid, or note the risk in the spec.

## 6. Reduced motion and touch

Every animation in the spec has a reduced-motion variant: fewer and gentler, not none. Keep opacity and color changes that explain a state; remove movement, scaling and parallax. A hero sequence becomes its final frame with a short fade.

Hover motion applies to mouse and trackpad only. Each hover effect has a touch equivalent or is not needed on touch (knowledge/design/rules/figma-build.md, Mobile).

## 7. Choosing and building in Figma

1. Run sections 1–2 for the item. If it fails the gate, say so and propose a static state instead.
2. Describe two or three options in the vocabulary below, each with properties, duration, and named curve. Where the environment can render a disposable preview in chat (for example an inline HTML widget), show them live; the preview is for choosing only and is not delivered as code.
3. When the designer describes a feeling, translate it into parameters with the table below, and ask for a reference site or video if it stays vague.
4. Build Smart Animate keyframes only for the chosen option. Name keyframe frames `{Element} / K0`, `K1`…, keep them on Final Design next to the element, and record the flow.
5. Ask the designer to play it in Present mode, also slowed down (durations ×2–5 on a copy) to check that layers move in sync, and to look again later with fresh eyes. The agent cannot play prototypes.

### Feeling words → parameters

| The designer says | Usually means | Try |
|---|---|---|
| "Too sharp", «резко» | Too short, or ease-in | Longer by 50–100 ms, strong ease-out |
| "Jerky", «дёргано» | Keyframes restarting, steps too far apart, no stagger | Fewer keyframes, transitions between states, 30–80 ms stagger |
| "Slow", «тормозит» | Over budget, or a delay before motion starts | Back into the budget, remove the delay |
| "Softer", «мягче» | Gentler start and stop | Ease-in-out or drawer curve, slightly longer, less distance |
| "Richer", «богаче», «эффектнее» | More layers, not more speed | Stagger, a second property (opacity with scale), a short reveal |
| "Floaty", «вязко» | Too long, or bounce | Shorter, remove bounce |
| "Cheap", «дёшево» | Default curves, everything moving at once | Named curves, one moving thing at a time |

### Vocabulary

Use these names with the designer and in the spec:

- **Fade**: opacity in or out.
- **Slide**: enters from an edge.
- **Scale in**: grows from slightly smaller, with a fade.
- **Pop**: scale in with a slight overshoot (rare moments only).
- **Reveal**: uncovered by a growing clip or mask.
- **Stagger**: items one after another with a small delay.
- **Orchestration**: several animations timed as one motion.
- **Crossfade**: one state fades out while the next fades in, in place.
- **Morph**: one shape becomes another.
- **Shared element**: the same element travels from one place to another, like a thumbnail becoming a card.
- **Origin-aware**: grows from its trigger.
- **Press**: feedback on pressing.
- **Hover lift / fill**: hover feedback by elevation or fill.
- **Hold to confirm**: an action completes only after a press is held.
- **Scroll reveal**: content appears as it scrolls into view (once, not on every pass).
- **Parallax**: layers scroll at different speeds (use sparingly; remove in reduced motion).
- **Marquee**: continuous horizontal movement (needs a pause control if it runs over 5 s).
- **Ambient**: a slow loop that runs by itself (stops when the block leaves the screen).
- **Spring**: physics-based motion without a fixed duration.
- **Overshoot / bounce**: passes the target and settles back.

## 8. Motion spec

Keep one table in the Design Direction, "Interaction and motion". It is what developers implement:

| Element | Trigger | Frequency | Purpose | Properties | Duration | Curve or spring | Reduced motion | Touch |
|---|---|---|---|---|---|---|---|---|
| Button / primary | Hover (pointer only) | Tens per visit | Feedback | Fill reveal from cursor (clip), label color | 200 ms in, 150 ms out | ease-out `0.23, 1, 0.32, 1` | Color change only | None |
| Mini cart | Open / close | Occasional | Spatial consistency | Slide from right, scrim opacity | 300 ms / 220 ms | ease-drawer `0.32, 0.72, 0, 1` | Fade only | Same |

- One row per kind of element, not per instance.
- Prototype flows (frame IDs, delays) stay in "Prototype flows"; this table states the intent and values.
- Items that were gated out are listed below the table with the reason, so nobody adds them later by accident.
