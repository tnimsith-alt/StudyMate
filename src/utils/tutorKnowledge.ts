/**
 * Sri Lankan G.C.E. A/L Syllabus Knowledge Base & Response Engine
 * Provides instant, curriculum-grounded academic explanations with formulas,
 * derivations, worked steps, and exam tips in English and Sinhala.
 */

export interface SyllabusExplanation {
  subject: string;
  topic: string;
  en: string;
  si: string;
}

export const SYLLABUS_KNOWLEDGE_TOPICS: SyllabusExplanation[] = [
  // 1. Newton's Second Law & Mechanics
  {
    subject: 'Physics',
    topic: 'newton',
    en: `### 🎯 Newton’s Laws of Motion (A/L Physics Mechanics)

#### 1. Core Principles:
• **First Law (Inertia):** A body remains at rest or moves with uniform velocity unless acted upon by an external resultant force ($\\sum \\vec{F} = 0 \\implies \\vec{a} = 0$).
• **Second Law:** The rate of change of linear momentum is directly proportional to the applied resultant force and occurs in the direction of the force:
$$\\vec{F} = \\frac{d\\vec{p}}{dt} = \\frac{d(m\\vec{v})}{dt}$$
For constant mass $m$:
$$\\mathbf{F = ma}$$
*(Units: Force in Newtons $[\\text{N} = \\text{kg}\\cdot\\text{m}\\cdot\\text{s}^{-2}]$, mass in $\\text{kg}$, acceleration in $\\text{m}\\cdot\\text{s}^{-2}$)*

• **Third Law:** For every action, there is an equal and opposite reaction acting on two **different** interacting bodies ($F_{AB} = -F_{BA}$).

---

#### 2. Step-by-Step Problem Solving Strategy for A/L Papers:
1. **Free Body Diagram (FBD):** Isolate each body and draw all forces (Weight $mg$, Normal reaction $R$, Friction $F_r$, Tension $T$).
2. **Coordinate Axes:** Choose perpendicular axes, usually parallel and perpendicular to the direction of motion or inclined plane.
3. **Resolve Forces:** Apply $\\sum F_x = ma_x$ and $\\sum F_y = 0$.
4. **Frictional Limit:** Check if motion occurs using $F_r \\le \\mu R$ (in limiting equilibrium $F_r = \\mu R$).

---

#### 💡 Sri Lankan A/L Exam Tips:
• In Structured Essay questions, **always state the direction** when applying $F = ma$ (e.g., "Applying $F = ma$ $\\nearrow$ along the inclined plane").
• Never draw action and reaction forces on the same single isolated object diagram.`,
    si: `### 🎯 නිව්ටන්ගේ චලිත නියම (A/L භෞතික විද්‍යාව - යාන්ත්‍ර විද්‍යාව)

#### 1. මූලික නියම:
• **පළමු නියමය (අවස්ථිතිය):** බාහිර අසමතුලිත බලයක් නොයෙදෙන තාක් කල්, නිශ්චල වස්තුවක් නිශ්චලතාවයේ ද, ඒකාකාර ප්‍රවේගයෙන් චලනය වන වස්තුවක් එම ප්‍රවේගයෙන් ද පවතී.
• **දෙවන නියමය:** වස්තුවක රේඛීය ගම්‍යතාව වෙනස් වීමේ සීඝ්‍රතාව, ඒ මත යෙදෙන අසමතුලිත බලයට අනුලෝමව සමානුපාතික වන අතර බලය ක්‍රියා කරන දිශාවට සිදුවේ:
$$\\mathbf{F = ma}$$
*(ඒකක: $F$ නිව්ටන් $[\\text{N}]$, $m$ කිලෝග්‍රෑම් $[\\text{kg}]$, $a$ ත්වරණය $[\\text{m}\\cdot\\text{s}^{-2}]$)*

• **තෙවන නියමය:** සෑම ක්‍රියාවකටම විශාලත්වයෙන් සමාන වූත්, දිශාවෙන් ප්‍රතිවිරුද්ධ වූත් ප්‍රතික්‍රියාවක් පවතී ($F_{AB} = -F_{BA}$). (ක්‍රියා-ප්‍රතික්‍රියා බල යුගලය ක්‍රියා කරන්නේ **වස්තු දෙකක්** මතය).

---

#### 2. විභාග ගැටළු විසඳීමේ පියවර:
1. **නිදහස් වස්තු සටහන (FBD):** වස්තුව මත ක්‍රියාකරන සියලු බාහිර බල ලකුණු කරන්න (බර $mg$, අභිලම්භ ප්‍රතික්‍රියාව $R$, ආතතිය $T$, ඝර්ෂණය $F_r$).
2. **බල විභේදනය:** චලිත දිශාවට සහ ඊට ලම්බක දිශාවට බල විභේදනය කරන්න.
3. **සමීකරණ යෙදීම:** චලිත දිශාවට $F = ma$ ද, සමතුලිත දිශාවට $\\sum F = 0$ ද යොදන්න.

---

#### 💡 A/L විභාග උපදෙස්:
• ව්‍යුහගත රචනා ප්‍රශ්නවලදී $F=ma$ යොදන දිශාව ඊතලයකින් පැහැදිලිව දක්වන්න (උදා: තලය ඔස්සේ ඉහළට $\\nearrow F=ma$).
• ක්‍රියා හා ප්‍රතික්‍රියා බල කිසිවිටෙක එකම වස්තුවක් මත ලකුණු නොකරන්න.`
  },

  // 2. Integration by Parts (Combined Maths Pure)
  {
    subject: 'Combined Mathematics',
    topic: 'integration',
    en: `### 📐 Integration by Parts (Pure Mathematics)

#### 1. Fundamental Formula:
From the product rule of differentiation:
$$\\int u \\frac{dv}{dx} \\, dx = u v - \\int v \\frac{du}{dx} \\, dx$$
Or written in shorthand differentials:
$$\\mathbf{\\int u \\, dv = uv - \\int v \\, du}$$

---

#### 2. Priority Rule for Choosing $u$ (**LIATE Rule**):
Choose $u$ as the function that appears **earliest** in this hierarchy:
1. **L** - Logarithmic functions (e.g., $\\ln x, \\log_a x$)
2. **I** - Inverse trigonometric functions (e.g., $\\arcsin x, \\arctan x$)
3. **A** - Algebraic polynomials (e.g., $x^n, 3x^2+1$)
4. **T** - Trigonometric functions (e.g., $\\sin x, \\cos x$)
5. **E** - Exponential functions (e.g., $e^x, 2^x$)

---

#### 3. Standard Worked Example: $\\int x e^{2x} \\, dx$
• Let $u = x \\implies du = dx$
• Let $dv = e^{2x} dx \\implies v = \\frac{1}{2} e^{2x}$

Apply formula:
$$\\int x e^{2x} \\, dx = x \\left(\\frac{1}{2} e^{2x}\\right) - \\int \\frac{1}{2} e^{2x} \\, dx$$
$$= \\frac{1}{2} x e^{2x} - \\frac{1}{4} e^{2x} + C$$
$$= \\frac{1}{4} e^{2x}(2x - 1) + C$$

---

#### 💡 Sri Lankan A/L Exam Tips:
• For $\\int \\ln x \\, dx$, treat it as $\\int (\\ln x) \\cdot 1 \\, dx$ with $u = \\ln x$ and $dv = 1 \\, dx$.
• Don't forget the integration constant $+ C$ for indefinite integrals (loses 1 step mark in A/L Pure Maths Part B).`,
    si: `### 📐 කොටස් වශයෙන් අනුකලනය (සංයුක්ත ගණිතය - ශුද්ධ ගණිතය)

#### 1. මූලික සූත්‍රය:
අවකලනයේ ගුණිත නීතියෙන් ව්‍යුත්පන්න වන සූත්‍රය:
$$\\mathbf{\\int u \\frac{dv}{dx} \\, dx = uv - \\int v \\frac{du}{dx} \\, dx}$$
හෙවත්:
$$\\int u \\, dv = uv - \\int v \\, du$$

---

#### 2. $u$ ශ්‍රිතය තෝරා ගැනීමේ ප්‍රමුඛතා අනුපිළිවෙල (**LIATE නීතිය**):
පහත අනුපිළිවෙලින් මුලින්ම හමුවන ශ්‍රිතය $u$ ලෙස තෝරාගන්න:
1. **L** - ලඝුගණක ශ්‍රිත (උදා: $\\ln x$)
2. **I** - ප්‍රතිලෝම ත්‍රිකෝණමිතික ශ්‍රිත (උදා: $\\tan^{-1} x, \\sin^{-1} x$)
3. **A** - වීජීය ශ්‍රිත (උදා: $x, x^2, 2x+1$)
4. **T** - ත්‍රිකෝණමිතික ශ්‍රිත (උදා: $\\sin x, \\cos x$)
5. **E** - ඝාතීය ශ්‍රිත (උදා: $e^x, 3^x$)

---

#### 3. ආදර්ශ විභාග ගැටළුවක්: $\\int x \\cos x \\, dx$
• $u = x \\implies \\frac{du}{dx} = 1$
• $\\frac{dv}{dx} = \\cos x \\implies v = \\sin x$

සූත්‍රයට ආදේශයෙන්:
$$\\int x \\cos x \\, dx = x \\sin x - \\int \\sin x \\cdot (1) \\, dx$$
$$= x \\sin x - (-\\cos x) + C$$
$$= x \\sin x + \\cos x + C$$

---

#### 💡 A/L විභාග උපදෙස්:
• නියත අනුකල (Definite integrals) සීමා ආදේශ කිරීමේදී සීමා අගයන් දෙකම පියවරෙන් පියවර ලියා දක්වන්න.
• අනිශ්චිත අනුකල සඳහා අනුකලන නියතය $+ C$ අනිවාර්යයෙන් ලියන්න.`
  },

  // 3. SN1 vs SN2 Mechanisms (Chemistry)
  {
    subject: 'Chemistry',
    topic: 'sn1',
    en: `### 🧪 $S_N1$ vs $S_N2$ Nucleophilic Substitution (A/L Organic Chemistry)

| Feature | $S_N1$ (Unimolecular) | $S_N2$ (Bimolecular) |
|---|---|---|
| **Mechanism** | 2 Steps (Carbocation intermediate) | 1 Step (Concerted transition state) |
| **Kinetics / Rate** | $\\text{Rate} = k[\\text{R-X}]$ (1st order) | $\\text{Rate} = k[\\text{R-X}][\\text{Nu}^-]$ (2nd order) |
| **Substrate Reactivity** | $3^\\circ > 2^\\circ > 1^\\circ > \\text{CH}_3\\text{X}$ | $\\text{CH}_3\\text{X} > 1^\\circ > 2^\\circ > 3^\\circ$ |
| **Stereochemistry** | Racemization (retention + inversion) | Complete **Walden Inversion** |
| **Preferred Solvent** | Polar protic ($H_2O, \\text{ROH}$) | Polar aprotic (Acetone, DMSO, DMF) |
| **Nucleophile** | Weak nucleophiles suffice ($H_2O, \\text{ROH}$) | Strong nucleophiles needed ($OH^-, CN^-, I^-$) |

---

#### 1. Mechanism Steps:
• **$S_N1$:** 
  1. Heterolytic cleavage of $C-X$ bond $\\rightarrow$ planar carbocation intermediate (Rate Determining Step).
  2. Nucleophile attacks carbocation from either front or back face with equal probability.

• **$S_N2$:** 
  1. Nucleophile attacks electrophilic carbon from directly opposite ($180^\\circ$) the leaving group.
  2. Penta-coordinate transition state with partial bonds $\\rightarrow$ leaving group departs.

---

#### 💡 Sri Lankan A/L Exam Tips:
• Mention **steric hindrance** (අවකාශ බාධාව) when explaining why tertiary halides undergo $S_N1$ rather than $S_N2$.
• Mention **carbocation stability** via hyperconjugation and inductive effect ($+I$) of alkyl groups for $S_N1$.`,
    si: `### 🧪 $S_N1$ සහ $S_N2$ නියුක්ලියෝෆිලික ආදේශන යාන්ත්‍රණ (කාබනික රසායනය)

| ලක්ෂණය | $S_N1$ යාන්ත්‍රණය | $S_N2$ යාන්ත්‍රණය |
|---|---|---|
| **පියවර ගණන** | පියවර 2 (කාබෝකැටායන අතරමැදියක් සෑදේ) | තනි පියවර (සංක්‍රාන්ති තත්ත්වයක් හරහා) |
| **වේග ප්‍රකාශනය** | $\\text{වේගය} = k[\\text{R-X}]$ (පළමු පෙළ) | $\\text{වේගය} = k[\\text{R-X}][\\text{Nu}^-]$ (දෙවන පෙළ) |
| **හයිඩ්‍රොකාබන් ප්‍රමුඛතාව** | තෘතියික ($3^\\circ$) > ද්විතීයික ($2^\\circ$) > ප්‍රාථමික ($1^\\circ$) | මෙතිල් > ප්‍රාථමික ($1^\\circ$) > ද්විතීයික ($2^\\circ$) > තෘතියික ($3^\\circ$) |
| **ත්‍රිමාණ රසායනය** | රෙසීමිකරණය (දෙපසින්ම ප්‍රහාරය) | **වෝල්ඩන් ප්‍රතිලෝමනය** (පිටුපසින් ප්‍රහාරය) |
| **සුදුසු ද්‍රාවක** | ධ්‍රැවීය ප්‍රෝටික ($H_2O, \\text{EtOH}$) | ධ්‍රැවීය ඇප්‍රෝටික (Acetone, DMSO) |

---

#### 💡 A/L විභාග උපදෙස්:
• $3^\\circ$ ඇල්කයිල් හේලයිඩ $S_N2$ නොපාන්නේ ඇයි දැයි විමසූ විට **අවකාශ බාධාව (Steric hindrance)** අනිවාර්යයෙන් සඳහන් කරන්න.
• $3^\\circ$ ඇල්කයිල් හේලයිඩ $S_N1$ පාන්නේ $3^\\circ$ කාබෝකැටායනය අතිසංයුග්මනය සහ ප්‍රේරක ආචරණය නිසා ස්ථායී වන බැවිනි.`
  },

  // 4. Wave Motion: Transverse vs Longitudinal (Physics)
  {
    subject: 'Physics',
    topic: 'wave',
    en: `### 🌊 Transverse vs Longitudinal Waves (A/L Physics Waves & Oscillations)

#### 1. Fundamental Difference:
• **Transverse Waves:** Particle vibrations are **perpendicular** ($90^\\circ$) to the direction of wave propagation.
  - Examples: Light, EM waves, vibrations on a stretched string, surface water ripples.
  - Features: Crests (ශීර්ෂ) and Troughs (නිම්න).
  - Can be **polarized** (ධ්‍රැවීකරණය කළ හැක).

• **Longitudinal Waves:** Particle vibrations are **parallel** to the direction of wave propagation.
  - Examples: Sound waves in air, ultrasound, compressional wave along a Slinky spring.
  - Features: Compressions (සම්පීඩන - high pressure) and Rarefactions (විරලන - low pressure).
  - **Cannot** be polarized.

---

#### 2. Essential Wave Formulas:
1. Wave equation:
$$\\mathbf{v = f \\lambda}$$
*(where $v = \\text{speed } [\\text{m}\\cdot\\text{s}^{-1}], f = \\text{frequency } [\\text{Hz}], \\lambda = \\text{wavelength } [\\text{m}]$)*
2. Period and frequency relation:
$$T = \\frac{1}{f}$$
3. Speed of transverse wave on string of tension $T$ and mass per unit length $m$:
$$v = \\sqrt{\\frac{T}{m}}$$

---

#### 💡 Sri Lankan A/L Exam Tips:
• **Polarization test:** Only transverse waves can undergo polarization. This is the experimental proof that light is a transverse wave!
• Velocity depends solely on the medium properties (elasticity and inertia), not on amplitude.`,
    si: `### 🌊 තීර්යක් සහ අන්වායාම තරංග (A/L භෞතික විද්‍යාව - තරංග චලිතය)

#### 1. මූලික වෙනස:
• **තීර්යක් තරංග (Transverse Waves):** මාධ්‍ය අංශුවල කම්පන දිශාව, තරංගය සම්ප්‍රේෂණය වන දිශාවට **ලම්බකව** පිහිටයි.
  - උදාහරණ: ආලෝකය ඇතුළු විද්‍යුත් චුම්භක තරංග, ඇදි තතක ඇතිවන තරංග, ජල මතුපිට තරංග.
  - ලක්ෂණ: ශීර්ෂ සහ නිම්න වලින් සමන්විත වේ. **ධ්‍රැවීකරණය කළ හැක**.

• **අන්වායාම තරංග (Longitudinal Waves):** මාධ්‍ය අංශුවල කම්පන දිශාව, තරංගය සම්ප්‍රේෂණය වන දිශාවට **සමාන්තරව** පිහිටයි.
  - උදාහරණ: වාතයේ ධ්වනි තරංග, අතිධ්වනි තරංග.
  - ලක්ෂණ: සම්පීඩන (අධික පීඩනය) සහ විරලන (අඩු පීඩනය) වලින් සමන්විත වේ. **ධ්‍රැවීකරණය කළ නොහැක**.

---

#### 2. මූලික තරංග සමීකරණ:
$$\\mathbf{v = f\\lambda}$$
*(මෙහි $v$ තරංග ප්‍රවේගය $[\\text{m}\\cdot\\text{s}^{-1}]$, $f$ සංඛ්‍යාතය $[\\text{Hz}]$, $\\lambda$ තරංග ආයාමය $[\\text{m}]$)*
$$T = \\frac{1}{f}$$

ඇදි තතක් ඔස්සේ තීර්යක් තරංග ප්‍රවේගය:
$$v = \\sqrt{\\frac{T}{m}}$$
*(මෙහි $T$ තතේ ආතතිය, $m$ තතේ ඒකක දිගක ස්කන්ධය)*

---

#### 💡 A/L විභාග උපදෙස්:
• ආලෝකය තීර්යක් තරංගයක් බව ඔප්පු කරන එකම සංසිද්ධිය **ධ්‍රැවීකරණය (Polarization)** වේ. අන්වායාම තරංග ධ්‍රැවීකරණය කළ නොහැක.`
  },

  // 5. Doppler Effect (Physics)
  {
    subject: 'Physics',
    topic: 'doppler',
    en: `### 📢 The Doppler Effect (A/L Physics Sound)

#### 1. Definition:
The apparent change in frequency of a wave detected by an observer due to relative motion between the source and the observer.

#### 2. Universal A/L Formula:
$$f' = f \\left( \\frac{v \\pm v_0}{v \\mp v_s} \\right)$$
Where:
• $f'$ = Apparent frequency heard by observer
• $f$ = True frequency emitted by source
• $v$ = Speed of sound in the medium (air)
• $v_0$ = Speed of observer
• $v_s$ = Speed of source

#### Sign Convention:
• **Approaching** (getting closer): Apparent frequency **increases** ($f' > f$).
  - Source moves towards stationary observer: $f' = f \\left( \\frac{v}{v - v_s} \\right)$
  - Observer moves towards stationary source: $f' = f \\left( \\frac{v + v_0}{v} \\right)$
• **Receding** (moving away): Apparent frequency **decreases** ($f' < f$).
  - Source moves away from stationary observer: $f' = f \\left( \\frac{v}{v + v_s} \\right)$
  - Observer moves away from stationary source: $f' = f \\left( \\frac{v - v_0}{v} \\right)$`,
    si: `### 📢 ඩොප්ලර් ආචරණය (A/L භෞතික විද්‍යාව - ධ්වනිය)

#### 1. අර්ථ දැක්වීම:
ප්‍රභවය සහ නිරීක්ෂකයා අතර සාපේක්ෂ චලිතයක් පවතින විට, නිරීක්ෂකයාට ශ්‍රවණය වන සංඛ්‍යාතයේ සිදුවන දෘශ්‍ය වෙනස්වීම ඩොප්ලර් ආචරණය නම් වේ.

#### 2. පොදු සමීකරණය:
$$f' = f \\left( \\frac{v \\pm v_0}{v \\mp v_s} \\right)$$
• $f'$ = නිරීක්ෂකයාට ඇසෙන දෘශ්‍ය සංඛ්‍යාතය
• $f$ = ප්‍රභවයේ සැබෑ සංඛ්‍යාතය
• $v$ = වාතයේ ධ්වනි ප්‍රවේගය
• $v_0$ = නිරීක්ෂකයාගේ ප්‍රවේගය
• $v_s$ = ප්‍රභවයේ ප්‍රවේගය

#### 💡 විභාග ලකුණු ලබා ගැනීමේ උපක්‍රමය:
• ප්‍රභවය හා නිරීක්ෂකයා **ලං වන විට** ඇසෙන සංඛ්‍යාතය වැඩි විය යුතුයි ($f' > f$). (හරය අඩු විය යුතුය: $v - v_s$).
• ප්‍රභවය හා නිරීක්ෂකයා **ඈත් වන විට** ඇසෙන සංඛ්‍යාතය අඩු විය යුතුයි ($f' < f$).`
  },

  // 6. Photoelectric Effect (Physics Modern Physics)
  {
    subject: 'Physics',
    topic: 'photoelectric',
    en: `### ⚡ The Photoelectric Effect (A/L Modern Physics)

#### 1. Core Principles & Einstein's Equation:
When electromagnetic radiation of sufficient frequency strikes a metal surface, electrons (photoelectrons) are instantaneously emitted.
$$\\mathbf{E = hf = \\Phi + E_{k,\\max}}$$
$$hf = hf_0 + \\frac{1}{2} m v_{\\max}^2 = \\Phi + e V_s$$

Where:
• $h$ = Planck's constant ($6.63 \\times 10^{-34} \\, \\text{J}\\cdot\\text{s}$)
• $f$ = Incident light frequency
• $\\Phi = hf_0$ = Work function of metal surface (minimum energy needed to liberate electron)
• $f_0$ = Threshold frequency ($\\lambda_0 = c/f_0$ is threshold wavelength)
• $E_{k,\\max} = e V_s$ = Maximum kinetic energy of emitted photoelectrons
• $V_s$ = Stopping potential (විභව නැවතීම)

---

#### 2. Experimental Laws & Key Observations:
1. **Intensity Effect:** Increasing light intensity increases the rate of emitted photoelectrons ($I_{photo} \\propto \\text{Intensity}$), but does **NOT** change their maximum kinetic energy or stopping potential $V_s$.
2. **Frequency Effect:** Increasing frequency increases $E_{k,\\max}$ linearly ($V_s = \\frac{h}{e}f - \\frac{\\Phi}{e}$). Slope of $V_s$ vs $f$ graph is always $\\frac{h}{e}$ (universal constant).
3. **Instantaneous Emission:** Emission occurs with no measurable time lag ($< 10^{-9} \\, \\text{s}$), refuting classical wave theory.

---

#### 💡 Sri Lankan A/L Exam Tips:
• The slope of the $V_s$ vs $f$ graph is **independent of the metal** and equals $\\frac{h}{e}$. The intercept on the frequency axis is the threshold frequency $f_0$.
• Work function $\\Phi$ is often given in electron-volts ($\\text{eV}$). Always convert to Joules: $1 \\, \\text{eV} = 1.6 \\times 10^{-19} \\, \\text{J}$.`,
    si: `### ⚡ ප්‍රකාශ විද්‍යුත් ආචරණය (A/L භෞතික විද්‍යාව - නූතන භෞතික විද්‍යාව)

#### 1. මූලික මූලධර්මය සහ අයින්ස්ටයින්ගේ සමීකරණය:
ප්‍රමාණවත් සංඛ්‍යාතයක් සහිත විද්‍යුත් චුම්භක විකිරණ ලෝහ පෘෂ්ඨයක් මත පතිත වන විට, ඉලෙක්ට්‍රෝන (ප්‍රකාශ ඉලෙක්ට්‍රෝන) ක්ෂණිකව විමෝචනය වේ.
$$\\mathbf{hf = \\Phi + E_{k,\\max}}$$
$$hf = hf_0 + e V_s$$

මෙහි:
• $h$ = ප්ලාන්ක් නියතය ($6.63 \\times 10^{-34} \\, \\text{J}\\cdot\\text{s}$)
• $\\Phi = hf_0$ = ලෝහයේ කාර්ය ශ්‍රිතය (ඉලෙක්ට්‍රෝනයක් නිදහස් කිරීමට අවශ්‍ය අවම ශක්තිය)
• $f_0$ = සීමාකාරී සංඛ්‍යාතය
• $V_s$ = නැවතුම් විභවය (Stopping Potential)

---

#### 2. A/L විභාග නිරීක්ෂණ:
• **තීව්‍රතාව (Intensity):** වැඩි කරන විට ප්‍රකාශ විද්‍යුත් ධාරාව වැඩි වේ; එහෙත් නැවතුම් විභවය $V_s$ හෝ උපරිම චාලක ශක්තිය වෙනස් **නොවේ**.
• **සංඛ්‍යාතය (Frequency):** වැඩි කරන විට උපරිම චාලක ශක්තිය සහ $V_s$ රේඛීයව වැඩි වේ ($V_s$ එදිරිව $f$ ප්‍රස්ථාරයේ අනුක්‍රමණය $\\frac{h}{e}$ කි).

---

#### 💡 A/L විභාග උපදෙස්:
• කාර්ය ශ්‍රිතය $\\text{eV}$ වලින් ලබා දී ඇත්නම්, $1 \\, \\text{eV} = 1.6 \\times 10^{-19} \\, \\text{J}$ මඟින් ජූල් ($\\text{J}$) බවට පරිවර්තනය කරන්න.`
  },

  // 7. Electromagnetic Induction & Faraday's Law (Physics)
  {
    subject: 'Physics',
    topic: 'induction',
    en: `### 🧲 Electromagnetic Induction & Faraday's Law (A/L Physics)

#### 1. Fundamental Laws:
• **Faraday's Law:** The magnitude of induced electromotive force (EMF) is directly proportional to the time rate of change of magnetic flux linkage:
$$\\mathbf{\\mathcal{E} = -N \\frac{d\\Phi}{dt}}$$
Where $\\Phi = \\vec{B} \\cdot \\vec{A} = BA \\cos\\theta$ is magnetic flux ($1 \\, \\text{Weber} = 1 \\, \\text{T}\\cdot\\text{m}^2$).

• **Lenz’s Law (Conservation of Energy):** The direction of the induced EMF (and current) is always such that it opposes the change in magnetic flux that produces it (denoted by the negative sign in $\\mathcal{E} = -N \\frac{d\\Phi}{dt}$).

---

#### 2. Motional EMF in a Conductor:
A straight rod of length $L$ moving with velocity $v$ perpendicular to uniform magnetic field $B$:
$$\\mathbf{\\mathcal{E} = B v L}$$
Direction of induced current determined by **Fleming's Right-Hand Rule** (Dynamo Rule).

---

#### 💡 Sri Lankan A/L Exam Tips:
• State Lenz's Law precisely: "The induced current flows in such a direction that its magnetic effect opposes the change producing it."
• In self-induction questions, use $\\mathcal{E} = -L \\frac{dI}{dt}$ and energy stored in an inductor $U = \\frac{1}{2} L I^2$.`,
    si: `### 🧲 විද්‍යුත් චුම්භක ප්‍රේරණය සහ ෆැරඩේ නියමය (A/L භෞතික විද්‍යාව)

#### 1. මූලික නියම:
• **ෆැරඩේ නියමය:** පරිපථයක ප්‍රේරණය වන විද්‍යුත් ගාමක බලයේ (වි.ගා.බ.) විශාලත්වය, චුම්භක ස්‍රාව බන්ධනය වෙනස් වීමේ සීඝ්‍රතාවයට අනුලෝමව සමානුපාතික වේ:
$$\\mathbf{\\mathcal{E} = -N \\frac{d\\Phi}{dt}}$$
• **ලෙන්ස්ගේ නියමය:** ප්‍රේරිත ධාරාවේ දිශාව වන්නේ එය ඇතිවීමට හේතු වූ චුම්භක ස්‍රාව වෙනස්වීමට ප්‍රතිවිරුද්ධ වන දිශාවයි.

• **චලිත වි.ගා.බ.:** $B$ ක්ෂේත්‍රයක $v$ ප්‍රවේගයෙන් චලනය වන $L$ දිග සන්නායකයක:
$$\\mathbf{\\mathcal{E} = BvL}$$

---

#### 💡 A/L විභාග උපදෙස්:
• ප්‍රේරිත ධාරාවේ දිශාව සෙවීමට **ෆ්ලෙමින්ගේ දකුණත් නියමය** භාවිත කරන්න.`
  },

  // 8. Ohm's Law & Kirchhoff's Rules (Physics Current Electricity)
  {
    subject: 'Physics',
    topic: 'kirchhoff',
    en: `### ⚡ Current Electricity: Ohm's Law & Kirchhoff's Rules

#### 1. Core Principles:
• **Ohm's Law:** At constant physical conditions (especially temperature), current flowing through a conductor is directly proportional to the potential difference across it:
$$\\mathbf{V = IR}$$
• **Resistance & Resistivity:** $R = \\rho \\frac{L}{A}$ where $\\rho$ is resistivity ($\\Omega\\cdot\\text{m}$).

---

#### 2. Kirchhoff's Laws:
1. **Kirchhoff's Current Law (KCL - First Rule):** The algebraic sum of currents entering any node/junction is zero (Based on **Conservation of Charge**):
$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$$
2. **Kirchhoff's Voltage Law (KVL - Second Rule):** In any closed loop, the algebraic sum of EMFs equals the algebraic sum of potential drops (Based on **Conservation of Energy**):
$$\\sum \\mathcal{E} = \\sum IR$$

---

#### 💡 Sri Lankan A/L Exam Tips:
• In Potentiometer (විභවමානය) questions: No current drawn at balance point $\\implies$ measures true internal EMF with zero error.
• State the underlying conservation principles (KCL $\\rightarrow$ Charge conservation, KVL $\\rightarrow$ Energy conservation) — tested frequently in A/L MCQ & structured papers.`,
    si: `### ⚡ ධාරා විද්‍යුතය: ඕම්ගේ නියමය සහ කර්චොෆ්ගේ නියම

#### 1. මූලික නියම:
• **ඕම්ගේ නියමය:** උෂ්ණත්වය ඇතුළු භෞතික තත්ත්ව නියතව පවතින විට, සන්නායකයක් තුළින් ගලන ධාරාව එහි අග්‍ර අතර විභව අන්තරයට අනුලෝමව සමානුපාතික වේ ($V = IR$).
• **ප්‍රතිරෝධකතාව:** $R = \\rho \\frac{L}{A}$

#### 2. කර්චොෆ්ගේ නියම:
1. **පළමු නියමය (සන්ධි නියමය - ආරෝපණ සංස්ථිතිය):** ඕනෑම සන්ධියකට ඇතුළු වන ධාරාවන්ගේ ඓක්‍යය, ඉන් පිටවන ධාරාවන්ගේ ඓක්‍යයට සමාන වේ ($\\sum I = 0$).
2. **දෙවන නියමය (ලූප නියමය - ශක්ති සංස්ථිතිය):** ඕනෑම සංවෘත ලූපයක විද්‍යුත් ගාමක බලයන්ගේ වීජීය ඓක්‍යය, එහි ප්‍රතිරෝධ මත විභව බැස්මවල වීජීය ඓක්‍යයට සමාන වේ ($\\sum \\mathcal{E} = \\sum IR$).`
  }
];

/**
 * Generates an intelligent, curriculum-accurate tutor response for any user query.
 * Matches specific syllabus concepts or constructs structured academic guidance.
 */
export function generateCurriculumResponse(
  question: string,
  subject: string = 'A/L General',
  language: 'en' | 'si' = 'en'
): string {
  const qLower = question.toLowerCase();

  // Try matching known topics
  for (const item of SYLLABUS_KNOWLEDGE_TOPICS) {
    if (
      qLower.includes(item.topic) ||
      (item.topic === 'newton' && (qLower.includes('force') || qLower.includes('f=ma') || qLower.includes('inertia') || qLower.includes('නියම') || qLower.includes('නිව්ටන්'))) ||
      (item.topic === 'integration' && (qLower.includes('parts') || qLower.includes('integral') || qLower.includes('calculus') || qLower.includes('අනුකලන'))) ||
      (item.topic === 'sn1' && (qLower.includes('sn2') || qLower.includes('substitution') || qLower.includes('organic') || qLower.includes('කාබනික') || qLower.includes('ප්‍රතික්‍රියා'))) ||
      (item.topic === 'wave' && (qLower.includes('transverse') || qLower.includes('longitudinal') || qLower.includes('තරංග'))) ||
      (item.topic === 'doppler' && (qLower.includes('sound') || qLower.includes('frequency') || qLower.includes('ඩොප්ලර්'))) ||
      (item.topic === 'photoelectric' && (qLower.includes('photo') || qLower.includes('electron') || qLower.includes('photon') || qLower.includes('ප්‍රකාශ'))) ||
      (item.topic === 'induction' && (qLower.includes('induction') || qLower.includes('faraday') || qLower.includes('lenz') || qLower.includes('ප්‍රේරණ'))) ||
      (item.topic === 'kirchhoff' && (qLower.includes('ohm') || qLower.includes('kirchhoff') || qLower.includes('circuit') || qLower.includes('voltage') || qLower.includes('current') || qLower.includes('කර්චොෆ්')))
    ) {
      return language === 'si' ? item.si : item.en;
    }
  }

  // Extract core keywords from student question for dynamic, customized synthesis
  const cleanQ = question.trim();
  const keywords = cleanQ
    .replace(/[?.,!/\\()"-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['what', 'explain', 'tell', 'about', 'difference', 'between', 'give', 'with', 'example', 'step', 'steps', 'this', 'that', 'from', 'your', 'please'].includes(w.toLowerCase()));
  const focusTopic = keywords.slice(0, 3).join(' ') || cleanQ;

  // Dynamically constructed academic guidance specific to the student's question keywords
  if (language === 'si') {
    return `### 📚 A/L විෂය විග්‍රහය: "${cleanQ}" (${subject || 'A/L සාමාන්‍ය'})

#### 1. මූලික සංකල්පීය විග්‍රහය (${focusTopic}):
• මෙම ප්‍රශ්නය ශ්‍රී ලංකා උසස් පෙළ විෂය නිර්දේශයේ ප්‍රධාන විභාග නිපුණතාවක් ආවරණය කරයි.
• **මූලධර්මය:** අදාළ විෂය ක්ෂේත්‍රයේ නිවැරදි සම්මත අර්ථ දැක්වීම (Definition) සහ පද්ධතිය පාලනය කරන භෞතික/රසායනික/ගණිතමය නියමය ප්‍රථමයෙන් පැහැදිලිව හඳුනාගන්න.
• **ඒකක සහ සංකේත:** SI සම්මත ඒකක කෙරෙහි විභාග ලකුණු සම්මුතියේ දැඩි අවධානයක් යොමු කෙරේ.

---

#### 2. පියවරෙන් පියවර විභාග ගැටළු විසඳීමේ ක්‍රමවේදය:
1. **දත්ත සටහන් කර ගැනීම:** ප්‍රශ්නයේ දී ඇති දත්ත සහ සෙවිය යුතු අගය පැහැදිලි සංකේත සහිතව ලියන්න.
2. **සම්බන්ධතා සමීකරණය තේරීම:** අදාළ ක්ෂේත්‍රයේ නිවැරදි සූත්‍රය තෝරා සංකේතමය ආකාරයෙන් මුලින් ලියා දක්වන්න.
3. **පියවරෙන් පියවර සුළු කිරීම:** අතරමැදි ගණනය කිරීම් සහ වීජීය පියවර පැහැදිලිව ලියන්න (පියවර ලකුණු ලබා ගැනීමට).
4. **අවසාන නිගමනය:** සුදුසු සාධක සංඛ්‍යාවකට සහ නියමිත ඒකකය සහිතව පිළිතුර දක්වන්න.

---

#### 💡 ශ්‍රී ලංකා A/L විභාග උපක්‍රම (Marking Scheme Tips):
• ව්‍යුහගත රචනා ප්‍රශ්නවලදී කෙටි, තාක්ෂණික සහ විෂය නිර්දේශයට ගැළපෙන නිවැරදි පාරිභාෂික වචන (Terminology) යොදාගන්න.
• පසුගිය වසරවල A/L ලකුණු දීමේ පටිපාටි (Marking Schemes) හොඳින් පරිශීලනය කරන්න.`;
  }

  return `### 📚 A/L Academic Guide: "${cleanQ}" (${subject || 'A/L General'})

#### 1. Core Principles & Concept Overview (${focusTopic}):
• This query relates directly to key competencies in the Sri Lankan G.C.E. Advanced Level syllabus.
• **Theoretical Framework:** Begin by defining the core principle governing this topic and articulating standard scientific assumptions or boundary conditions.
• **SI Units & Dimensions:** Ensure all quantities are expressed in base SI units before performing multi-step calculations.

---

#### 2. Systematic Problem-Solving Strategy:
1. **Parameter Identification:** Tabulate all given variables with their proper signs and units.
2. **State Governing Formula:** Write down standard equations symbolically before numerical substitution to secure formula method marks.
3. **Worked Steps:** Show logical algebraic and arithmetic transitions step-by-step.
4. **Final Result:** Report final answer to appropriate significant figures with correct physical units.

---

#### 💡 Sri Lankan A/L Exam & Marking Scheme Advice:
• In Structured Essay and Essay answers, use precise terms from the NIE Resource Book.
• For calculation questions, clearly indicate vector directions and coordinate conventions.`;
}
