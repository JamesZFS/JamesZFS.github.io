---
layout: archive
title: "Curriculum Vitae"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}
Here's a pdf version of my [CV](/files/cv.pdf)

[Work samples](#selected-course-projects)

# Education

### Master of Computer Science at ETH Zurich, Switzerland
- Sep. 2021 - Jul. 2024 (expected)
- Major in visual computing
- **GPA: 5.8/6.0**

### Bachelor of Computer Science in  at Tsinghua University, Beijing, China
- Majored in Physics, Sep. 2016 - Jul. 2018
- Changed major into Computer Science and Technology, Sep. 2018 - Jul. 2021
- **GPA: 3.89,  Rank: 4/204**

-----

# Scholarship & Awards

- **China National Scholarship** (Top 1%), Oct. 2020
- Comprehensive Excellence Scholarship (Top 10%) at Computer Science and Technology Department, Tsinghua, Oct. 2019
- Comprehensive Excellence Scholarship (Top 10%) at Physics Department, Tsinghua, Oct. 2017
- Third prize in The Challenge Cup (science and innovation competition) of Tsinghua, Oct. 2020
- National Silver Prize, Chinese National Olympiad in Physics, 2015
- Provincial Second Prize, Chinese National Olympiad in Informatics, 2014

-----

# Research Experience

### [Computer Graphics Laboratory](https://cgl.ethz.ch/), ETH, Zurich, Switzerland
- Master thesis, Dec. 2023 - Jul. 2024 (expected)
- Research on spatial subdivision for path guiding.

### Rendering Group, [Disney Research Studios](https://studios.disneyresearch.com/about-us/), Zurich, Switzerland
- Semester thesis (6.0/6.0), Apr. 2023 - Jul. 2023
- Research on improving the path sampling for realistic image synthesis using machine learning methods.

### [Realistic Graphics Lab](https://rgl.epfl.ch/), EPFL, Lausanne, Switzerland
- Summer research intern, Jun. 2022 - Sep. 2022
- Polish and extend kernel caching features in [Dr.Jit](https://rgl.epfl.ch/publications/Jakob2022DrJit), a just-in-time compiler for inverse rendering.

### [Graphics and Geometric Computing Group](https://cg.cs.tsinghua.edu.cn/), Tsinghua University, Beijing, China
- Undergraduate research fellow & bachelor thesis, Oct. 2019 - Jun. 2021
- Second author of [Ensemble Denoising for Monte Carlo Renderings](https://cg.cs.tsinghua.edu.cn/people/~kun/2021denoising/Ensemble_Denoising_SIGA2021_small.pdf).
- Published at SIGGRAPH Asia 2021.

### [Pervasive Human-Computer Interaction Group](https://pi.cs.tsinghua.edu.cn/), Tsinghua University, Beijing, China
- Undergraduate research fellow, Jan. 2019 - May 2019
- Third author of a [ProxiTalk](https://dl.acm.org/doi/abs/10.1145/3351276), a novel mobile phone interaction technique.
- Published at IMWUT 2019.

-----

# Work Experience

### ByteDance Inc, Shanghai, China
- Graphics programming intern at game department, Jun. 2020 - Sep. 2020
- Develop real-time real-tracing water pool graphics effects in Unity Engine.
- Parallelize wave simulation and caustics computation on GPU.

### SIGA Services AG, Ruswil, Switzerland
- Software engineer intern, Mar. 2022 - Jun. 2022
- Develop OpenGL solutions to render point clouds with Xamarin.

-----

# Selected Course Projects

## Master Courses, ETH Zurich

### [Computer Graphics](/cg/index.html) (6.0/6.0)

![cg](/images/projects/cg.png)

- Implement a physics-based renderer based on [Nori](https://cgl.ethz.ch/teaching/cg22/www-nori/index.html), an tutorial rendering framework.
- Advanced features:
  - Render participating media (clouds, smoke, etc) with multiple importance sampling.
  - Implement Disney BSDF, an appearance model widely used in production.
  - Procedural generation of a night city scene.

<br>

### [Scientific Visualization](https://github.com/JamesZFS/zwickypixies)

![scivis](/images/projects/scivis.png)

- Develop a real-time visualization application for cosmology simulation based on VTK library.
- Support interactive rendering of various particle properties (temperature, potential, velocity, etc).

<br>

### [Physics-based Simulation](https://github.com/Fiona730/Position-Based-Fluids-Taichi) (5.75/6.0)

![pbs](/images/projects/pbs.png)

- Implement [position based fluid](https://mmacklin.com/pbf_sig_preprint.pdf) simulation based on [Taichi](https://www.taichi-lang.org/).
- Handle fluid-solid interaction through collision detection.

<br>

### [Advanced Systems Lab](https://github.com/Fiona730/SPPM-CPU-Optimization?tab=readme-ov-file) (5.75/6.0)

![asl](/images/projects/asl.png)

- Implement and optimize [stochastic progressive photon mapping](https://cs.uwaterloo.ca/~thachisu/sppm.pdf), an offline rendering algorithm.
- Achieve a fully vectorized (SIMD) implementation with 22.7x speedup compared to the baseline.

<br><br>

## Bachelor Courses, Tsinghua University

### [Service Oriented Software Design and Development](https://github.com/JamesZFS/AntiNCP) (A+)

![soa](/images/projects/soa.png)

- Design and develop a web-based system to analyze and visualize COVID-19 related information.
- Integrate a web crawler to update COVID data and news periodically.
- Apply clustering and statistical methods to extract the topics and keywords of news.
- Design a beautiful frontend for visualizing geological and timeline data of diversed types.

<br>

### [Fundamentals of Computer Graphics](https://github.com/JamesZFS/Pharosa) (A)

![cg](/images/projects/cg-thu.png)

- Implement a C++ physically-based renderer from scratch.
- Advanced features: 
  - [stochastic progressive photon mapping](https://cs.uwaterloo.ca/~thachisu/sppm.pdf) global illumination algorithm.
  - ray intersection with Bezier surfaces through Newton's method.
  - parse scene files from JSON.

<br>

### [Fundamentals of Search Engine Technology](https://github.com/JamesZFS/ElasticJury) (A)

![search](/images/projects/search.png)

- Develop a search engine for judiciary cases.
- Implement a high-performance and high-concurrency GoLang backend.
- Create dedicated MySQL commands to do fast and complex search queries.
- Design and implement an intuitive and user-friendly frontend.

### [Human-Computer Interaction Theory and Technology](https://github.com/JamesZFS/IntelliZoomer) (A-)
- Propose and research on a mobile phone camera interaction app
- Core features:
  - Adjust the back camera's zoom ratio with the front camera's depth information.
  - Auto "capture" triggering by smile detection.
- Conduct a 14-user evaluation experiment and prove the effectiveness of our proposed app.

### [Computer Organization](https://github.com/JamesZFS/MIPS-CPUer) (A-)
- Design and implement a MIPS32 CPU in Verilog.
- Highlighted features:
  - Capable of running a tutorial operating system.
  - Support several peripherals including DVI video output and flash storage.
  - A fixed-point numerical system and a three-body problem simulation demo in MIPS assembly.

### [Principles and Practice of Compiler Construction](https://github.com/JamesZFS/Decaf) (A)
- Enhance a Java-like language compiler implemented in Rust.
- Add functional programming features including lambda expressions and first-class functions.
- Implement some compiling optimization actions and an [iterative global register allocation algorithm](http://www.cse.iitm.ac.in/~krishna/cs6013/george.pdf).

### [Software Engineering](https://github.com/JamesZFS/AwesomeCoding) (A)
- Develop a web-based live teaching platform for [Jisuanke Company](https://www.jisuanke.com/).

<br>

### Foundation of Object-Oriented Programming (A)

![oop](/images/projects/oop.png)

- Design and implement two physically-based 2D games based on Qt and [LiquidFun](https://google.github.io/liquidfun/) physics engine.
- [Repo 1](https://github.com/JamesZFS/Warzone), [repo 2](https://github.com/JamesZFS/Plongeur)

<br><br>

-----

# Skills

- Programming
  - Proficient in C/C++, Python, JavaScript
  - Familiar with Go, Rust, MySQL, Swift, C#, Assembly, Mathematica, Unity
- Language
  - Chinese: Native
  - English: Fluent
    - TOEFL 105 (reading 28, listening 27, speaking 24, writing 26)
    - GRE Verbal 156, Quantitative 169, AW 4.0
  - French: Intermediate (B1)
  - German: Beginner (A1)
