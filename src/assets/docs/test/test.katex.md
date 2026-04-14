# TEST KATEX

## Chapter 2 Section 2 Geometry of Space Curve  

<!-- canvas: eg03 -->

## Preview: Curvature Flow
<!-- 
<div class="canvas-trigger" data-scene="EG04">
  <button>View Loxodrome</button>
</div> -->
[View EG04 - Loxodrome](#canvas:EG04)  
[View Gaussian Curvature](#canvas:GaussianCurvature)  
[View Möbius Strip](#canvas:Mobius)


A sphere of radius a can be represented by the vector form: $\mathbf{r(\theta, \phi)} = a\space\sin(\theta)\cos(\phi)\mathbf{l_{1}} + a\space\cos(\theta)\mathbf{l_{2}} + a\space\sin(\theta) \sin(\phi)\mathbf{l_{3}},\$ where a is the radius of the sphere and $\mathbf{l_{1}, l_{2}, l_{3}}$ is a triad of orthogonal unit n-tuples.  
Then,  

$\mathbf{t} = \frac{\mathrm{d}\mathbf{r}}{\mathrm{d}s} = \frac{\delta \mathbf{r}}{\delta  \theta}\frac{\mathrm{d}\theta}{\mathrm{d}s} + \frac{\delta \mathbf{r}}{\delta  \phi}\frac{\mathrm{d}\phi}{\mathrm{d}s} \space = a\left(\cos(\theta)cos(\phi)\frac{\mathrm{d}\theta}{\mathrm{d}s} - \sin(\theta)sin(\phi)\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)\mathbf{l_{1}} -$

$a\space\sin(\theta)\frac{\mathrm{d}\theta}{\mathrm{d}s}\mathbf{l_{2}} + a\left(\cos(\theta)sin(\phi)\frac{\mathrm{d}\theta}{\mathrm{d}s} + \sin(\theta)cos(\phi)\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)\mathbf{l_{3}}$

$\frac{\mathrm{d}\mathbf{t}}{\mathrm{d}s} = \frac{\mathrm{d^2}\mathbf{r}}{\mathrm{d}s^2} = \frac{\delta^{2}\mathbf{r}}{\delta\theta^{2}}\(\frac{\mathrm{d}\theta}{\mathrm{d}s}\)^2 + \frac{\delta \mathbf{r}}{\delta\theta}\frac{\mathrm{d^2}\theta}{\mathrm{d}s^2} + \frac{\delta^{2}\mathbf{r}}{\delta\phi^{2}}\(\frac{\mathrm{d}\phi}{\mathrm{d}s}\)^2 + \frac{\delta \mathbf{r}}{\delta\phi}\frac{\mathrm{d^2}\phi}{\mathrm{d}s^2}$


$\space a\left[\cos(\theta)\cos(\phi)\frac{\mathrm{d^2}\theta}{\mathrm{d}s^2} - \sin(\theta)\cos(\phi)\left(\left(\frac{\mathrm{d}\theta}{\mathrm{d}s}\right)^2 + \left(\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)^2\right) - \sin(\theta)\sin(\phi)\frac{\mathrm{d^2}\phi}{\mathrm{d}s^2}\right]\mathbf{l_1}+$  

$\space a\left[-\sin(\theta)\frac{\mathrm{d^2}\theta}{\mathrm{d}s^2} - \cos(\theta)\left(\left(\frac{\mathrm{d}\theta}{\mathrm{d}s}\right)^2 + \left(\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)^2\right) + \cos(\phi)\frac{\mathrm{d^2}\phi}{\mathrm{d}s^2}\right]\mathbf{l_2} +$  

$\space a\left[\cos(\theta)\sin(\phi)\frac{\mathrm{d^2}\theta}{\mathrm{d}s^2} - \sin(\theta)\sin(\phi)\left(\left(\frac{\mathrm{d}\theta}{\mathrm{d}s}\right)^2 + \left(\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)^2\right) + \sin(\theta)\cos(\phi)\frac{\mathrm{d^2}\phi}{\mathrm{d}s^2}\right]\mathbf{l_3}$  

$\lbrace\space \frac{\mathrm{d^2}\theta}{\mathrm{d}s^2} = \frac{\mathrm{d^2}\phi}{\mathrm{d}s^2} = 0, \space and \space \left(\left(\frac{\mathrm{d}\theta}{\mathrm{d}s}\right)^2 + \left(\frac{\mathrm{d}\phi}{\mathrm{d}s}\right)^2\right) = \frac{1}{a^2}\rbrace$

$=-a\left(\sin(\theta)\cos(\phi)\mathbf{l_{1}} + \cos(\theta)\mathbf{l_{2}} + \sin(\theta)\sin(\phi)\mathbf{l_{3}}\right)$  

|First Header | Second Header|
|-------------|--------------|
|Content Cell | Content Cell |
|Content Cell | Content Cell |

Ah yes, the good old Gaussian surface—Gauss’s Law’s best friend. Let’s dive in.

A Gaussian surface is an imaginary closed surface used in Gauss’s Law to calculate the electric flux through a region. The beauty of it is that the surface doesn’t have to physically exist—it’s a mathematical tool that helps simplify problems involving electric fields, especially when there’s symmetry involved.

The core idea behind it

Gauss’s Law states:

$\Phi_E = \oint \vec{E} \cdot d\vec{A} = \frac{q_{\text{inside}}}{\varepsilon_0}$

Where:

$\Phi_E$ is the electric flux through the surface.

$\vec{E}$ is the electric field vector.

$d\vec{A}$ is an infinitesimal area element pointing outward.

$q_{\text{inside}}$ is the net charge enclosed by the surface.

$\varepsilon_0$ is the vacuum permittivity.

This law is especially powerful when there’s symmetry, like spherical, cylindrical, or planar symmetry. Then you can cleverly choose a Gaussian surface that makes $\vec{E}$ constant over the surface or align it perfectly with $d\vec{A}$, making the integral doable or trivial.

Common Gaussian surfaces

Sphere around a point charge → great for radial symmetry

Cylinder around a line of charge → nice for infinite line symmetry

Box or pillbox for an infinite sheet → handy for planar symmetry

A practical tip

The real trick is picking a surface that exploits the symmetry of the charge distribution. Choose wisely, and Gauss’s Law turns a painful triple integral into a one-liner.

Want to walk through a quick example, like the field around a charged wire or inside a spherical shell? Oho, we’re taking the scenic route through geometry now—excellent choice.

The Theorema Egregium ( Latin for **remarkable** $\sin(\theta)$ ) was coined by none other than Carl Friedrich Gauss, and its brilliance lies in how it links intrinsic geometry to curvature. In simple terms:

**The Gaussian curvature of a surface is preserved under local isometries.**

In even plainer terms: you can bend a surface all you want—say, turning a flat sheet of paper into a cylinder—but as long as you’re not stretching or compressing it, the curvature stays the same.

Why it’s remarkable

Before Gauss, curvature was thought to depend on how the surface is embedded in space. But this theorem flipped that idea. It showed that you don’t need to peek outside the surface at all—the curvature can be completely determined from measurements made within the surface itself, like distances and angles.

A few implications:

You can’t flatten a sphere onto a plane without distortion (which is why world maps are always a bit off).

A cylinder has zero Gaussian curvature, just like a flat plane—it’s locally the same in terms of geometry.

It laid the groundwork for Riemannian geometry and, eventually, Einstein’s general relativity.

Think of it as the original **You can’t have it all** in geometry: you either preserve distances or get to flatten things, but not both.

Would you like a quick demo of how curvature behaves on different surfaces? Or maybe how Gaussian curvature is calculated from the first and second fundamental forms? Let’s take this in two elegant steps, as promised.

🌐 Quick Demo: How Curvature Behaves on Different Surfaces

Imagine walking on a surface and measuring how much it curves. The Gaussian curvature at a point is the product of the maximum and minimum curvatures you can measure through that point on different directions (formally called the principal curvatures $k_1$ and $k_2$):

$K = k_1 \cdot k_2$

Here’s how this plays out:

|  Surface Type       | $ k_1 $ | $ k_2 $ | K = k₁·k₂ | Result                     |
|---------------------|---------|---------|-----------|----------------------------|
| Plane               | 0       | 0       | 0         | Flat surface               |
| Sphere              | +       | +       | Positive  | Dome-like everywhere       |
| Cylinder            | 0       | +       | 0         | Curves in one direction    |
| Saddle (Hyperbolic) | +       | -       | Negative  | Curves opposite ways       |

So if you’re standing on a saddle surface (like a Pringles chip), the curvature curls up one way and down the other. The product is negative. But on a balloon? Everything curves the same way—positive.

📐 Gaussian Curvature via Fundamental Forms

Now to the mathier part—calculating Gaussian curvature purely from the intrinsic geometry of a surface.

Let’s define:

First Fundamental Form I: Describes lengths and angles on the surface.

Second Fundamental Form II: Encodes how the surface bends in space.

From these, we compute:

$K = \frac{\det(\text{Second Fundamental Form})}{\det(\text{First Fundamental Form})}$

Or symbolically:

$K = \frac{LN - M^2}{EG - F^2}$

Where:

$E, F, G$ are coefficients from the First Fundamental Form

$L, M, N$ are coefficients from the Second Fundamental Form

And each of these comes from derivatives of the surface’s parametrization.

If you'd like, I can walk through a full example—say, computing the curvature of a sphere or a paraboloid—step by step. Shall we continue in that direction? Perfect. Let's roll up our sleeves and calculate the Gaussian curvature of a sphere, which is one of the most elegant and symmetric surfaces out there.

🎯 Step 1: Parametrize the Sphere

Let’s take a sphere of radius $ r $. A standard parametrization using spherical coordinates is:

$\vec{X}(\theta, \phi) = \begin{bmatrix} r \sin(\phi) \cos(\theta) \ r \sin(\phi) \sin(\theta) \ r \cos(\phi) \end{bmatrix}$

where:

$\theta \in [0, 2\pi]$ (azimuthal angle)

$\phi \in [0, \pi]$ (polar angle)

📐 Step 2: Compute the First Fundamental Form

Take partial derivatives of $ \vec{X} $:</br>
$\vec{X_{\theta}} = \begin{bmatrix} -r \sin(\phi) \sin(\theta) \cr r \sin(\phi) \cos(\theta) \cr 0 \end{bmatrix}, \space \vec{X_{\phi}} = \begin{bmatrix} r \cos(\phi) \cos(\theta) \cr r \cos(\phi) \sin(\theta) \cr -r \sin(\phi) \end{bmatrix}$

Now calculate:  
$ E = \vec{X_{\theta}} \cdot \vec{X_{\theta}} = r^2 \sin^2(\phi) $</br>
$ F = \vec{X_{\theta}} \cdot \vec{X_{\phi}} = 0 $</br>
$ G = \vec{X}\phi \cdot \vec{X}\phi = r^2 $

🧮 Step 3: Compute the Second Fundamental Form

First, compute the unit normal:</br>
$\vec{N} = \frac{\vec{X}\theta \times \vec{X}\phi}{|\vec{X}\theta \times \vec{X}\phi|} = \frac{1}{r} \vec{X}(\theta, \phi)$

Then take second partials:
$\vec{X_{\theta\theta}} = -r \sin(\phi) \cos(\theta)\hat{i} - r \sin(\phi) \sin(\theta) \hat{j}$

$\vec{X_{\phi\phi}} = -r \sin(\phi) \cos(\theta) \hat{i} - r \sin(\phi) \sin(\theta)\hat{j} - r \cos(\phi)\hat{k} $

$\vec{X_{\theta\phi}} = \text{(not needed since ( F = 0 ))} $

Now calculate:</br>
$L = \vec{X_{\theta\theta}} \cdot \vec{N} = -r \sin^2(\phi)$

$N = \vec{X_{\phi\phi}} \cdot \vec{N} = -r$

$M = 0$

🌀 Step 4: Gaussian Curvature

Now plug everything into the formula:

$ K = \frac{LN - M^2}{EG - F^2} = \frac{(-r \sin^2(\phi))(-r)}{(r^2 \sin^2(\phi))(r^2)} = \frac{r^2 \sin^2(\phi)}{r^4 \sin^2(\phi)} = \frac{1}{r^2} $

✅ And there it is! The Gaussian curvature of a sphere of radius $ r $ is constant and positive:

$ \boxed{K = \frac{1}{r^2}} $

Let me know if you'd like to try a more exotic example next—like a saddle surface or a paraboloid—or we can explore how this ties into intrinsic vs extrinsic geometry.

$$
\begin{equation}
\begin{aligned}
  a&=b+c \cr
  &=ggg+f
\end{aligned}
\end{equation}
$$
</br>
</br>
<!-- 
**Those are the excerpts from the book of The Introduction to Vector and Tensor Analysis: Robert C. Wrede (0-486-61879-X)**  
[DOVER BOOKS ON MATHMATICS](https://store.doverpublications.com/)   -->

