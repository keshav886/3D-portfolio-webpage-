import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function Portfolio() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const robotRef = useRef({});
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 0.9, 6.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.4);
    fillLight.position.set(-3, 1, 3);
    scene.add(fillLight);

    // Robot group
    const robot = new THREE.Group();

    // Blue "glass toy" material palette
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x7fb2f0,
      metalness: 0.15,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    const glassDarkMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.15,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f1f3d, metalness: 0.3, roughness: 0.3 });
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7, roughness: 0.2 });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.35,
      metalness: 0.2,
      roughness: 0.3,
    });
    const glowMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, emissive: 0xbfdbfe, emissiveIntensity: 0.8 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.1 });

    // Body (rounded pill shape)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), glassMat);
    body.scale.set(1, 1.15, 0.85);
    body.position.y = 0.15;
    robot.add(body);

    // Chest panel (recessed screen)
    const panelBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.06), visorMat);
    panelBack.position.set(0, 0.2, 0.68);
    robot.add(panelBack);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.08), panelMat);
    panel.position.set(0, 0.2, 0.72);
    robot.add(panel);

    // "</>" glyph on the chest, built from thin glowing boxes
    const glyph = new THREE.Group();
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.02), glowMat);
    slash.rotation.z = 0.5;
    glyph.add(slash);
    function makeBracket(mirror) {
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.02), glowMat);
      top.position.set(0.06 * mirror, 0.09, 0);
      top.rotation.z = -0.6 * mirror;
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.02), glowMat);
      bottom.position.set(0.06 * mirror, -0.09, 0);
      bottom.rotation.z = 0.6 * mirror;
      g.add(top, bottom);
      return g;
    }
    const leftBracket = makeBracket(-1);
    leftBracket.position.set(-0.17, 0.02, 0);
    const rightBracket = makeBracket(1);
    rightBracket.position.set(0.17, 0.02, 0);
    glyph.add(leftBracket, rightBracket);
    glyph.position.set(0, 0.22, 0.77);
    robot.add(glyph);

    const dotGeo = new THREE.SphereGeometry(0.025, 8, 8);
    [-0.09, 0, 0.09].forEach((dx) => {
      const dot = new THREE.Mesh(dotGeo, glowMat);
      dot.position.set(dx, -0.1, 0.77);
      robot.add(dot);
    });

    // Neck joint
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.18, 16), ringMat);
    neck.position.y = 0.95;
    robot.add(neck);

    // Head group (rotates toward mouse)
    const head = new THREE.Group();
    head.position.y = 1.5;

    const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 28), glassDarkMat);
    headBall.scale.set(1.05, 1, 0.9);
    head.add(headBall);

    // Ears (small capsule-style side caps)
    const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 16);
    const leftEar = new THREE.Mesh(earGeo, ringMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.78, -0.05, 0);
    const rightEar = new THREE.Mesh(earGeo, ringMat);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.78, -0.05, 0);
    head.add(leftEar, rightEar);

    // Eyes: recessed dark sockets with a glowing ring outline ("O O" style)
    const socketGeo = new THREE.CircleGeometry(0.15, 24);
    const leftSocket = new THREE.Mesh(socketGeo, visorMat);
    leftSocket.position.set(-0.24, 0.02, 0.655);
    const rightSocket = new THREE.Mesh(socketGeo, visorMat);
    rightSocket.position.set(0.24, 0.02, 0.655);
    head.add(leftSocket, rightSocket);

    const eyeRingGeo = new THREE.TorusGeometry(0.12, 0.028, 12, 28);
    const leftEye = new THREE.Mesh(eyeRingGeo, eyeMat);
    leftEye.position.set(-0.24, 0.02, 0.665);
    const rightEye = new THREE.Mesh(eyeRingGeo, eyeMat);
    rightEye.position.set(0.24, 0.02, 0.665);
    head.add(leftEye, rightEye);

    const pupilGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const leftPupil = new THREE.Mesh(pupilGeo, eyeMat);
    leftPupil.position.set(-0.24, 0.02, 0.68);
    const rightPupil = new THREE.Mesh(pupilGeo, eyeMat);
    rightPupil.position.set(0.24, 0.02, 0.68);
    head.add(leftPupil, rightPupil);

    // Antenna
    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), ringMat);
    antennaStem.position.set(0, 0.85, 0);
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), ringMat);
    antennaTip.position.set(0, 1.08, 0);
    head.add(antennaStem, antennaTip);

    robot.add(head);

    // Shoulders / arms
    function makeArm(sideMultiplier) {
      const arm = new THREE.Group();
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), glassMat);
      arm.add(shoulder);
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.55, 12), glassMat);
      upperArm.position.y = -0.32;
      arm.add(upperArm);
      const elbowRing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), ringMat);
      elbowRing.position.y = -0.58;
      arm.add(elbowRing);
      const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.5, 12), glassMat);
      lowerArm.position.y = -0.86;
      arm.add(lowerArm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), glassMat);
      hand.position.y = -1.14;
      arm.add(hand);
      arm.position.set(sideMultiplier * 0.82, 0.55, 0);
      arm.rotation.z = sideMultiplier * -0.12;
      return arm;
    }
    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);
    robot.add(leftArm, rightArm);

    // Legs (tapered, rounded feet)
    function makeLeg(sideMultiplier) {
      const leg = new THREE.Group();
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.5, 16), glassMat);
      upperLeg.position.y = -0.28;
      leg.add(upperLeg);
      const kneeRing = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), ringMat);
      kneeRing.position.y = -0.55;
      leg.add(kneeRing);
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.42, 16), glassMat);
      lowerLeg.position.y = -0.8;
      leg.add(lowerLeg);
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), glassMat);
      foot.scale.set(1, 0.7, 1.3);
      foot.position.y = -1.05;
      foot.position.z = 0.05;
      leg.add(foot);
      leg.position.set(sideMultiplier * 0.28, -0.35, 0);
      return leg;
    }
    const leftLeg = makeLeg(-1);
    const rightLeg = makeLeg(1);
    robot.add(leftLeg, rightLeg);

    robot.position.y = 0.3;
    scene.add(robot);

    robotRef.current = { head, leftArm, rightArm, robot };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let frameId;
    let t = 0;
    let lastMouseTime = Date.now();
    let lastMx = 0, lastMy = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.02;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (Math.abs(mx - lastMx) > 0.001 || Math.abs(my - lastMy) > 0.001) {
        lastMouseTime = Date.now();
        lastMx = mx;
        lastMy = my;
      }
      const idle = Date.now() - lastMouseTime > 1200;

      const { head, leftArm, rightArm, robot } = robotRef.current;

      if (idle) {
        head.rotation.y = Math.sin(t * 0.6) * 0.3;
        head.rotation.x = Math.sin(t * 0.4) * 0.08;
        robot.position.y = 0.3 + Math.sin(t * 1.2) * 0.08;
        robot.rotation.y = Math.sin(t * 0.3) * 0.1;
        leftArm.rotation.z = -0.15 + Math.sin(t * 1.5) * 0.05;
        rightArm.rotation.z = 0.15 - Math.sin(t * 1.5) * 0.05;
      } else {
        const targetY = mx * 0.6;
        const targetX = -my * 0.4;
        head.rotation.y += (targetY - head.rotation.y) * 0.1;
        head.rotation.x += (targetX - head.rotation.x) * 0.1;
        robot.rotation.y += (mx * 0.15 - robot.rotation.y) * 0.05;
        robot.position.y += (0.3 - robot.position.y) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  const skills = [
    { name: "Manual Testing", level: 92 },
    { name: "Functional Testing", level: 90 },
    { name: "Regression Testing", level: 88 },
    { name: "API Testing (Postman)", level: 75 },
    { name: "Test Case Design", level: 90 },
    { name: "SQL", level: 70 },
  ];

  const skillTags = ["JIRA", "STLC / SDLC", "Defect Life Cycle Management", "Java", "C#", "Python"];

  const experience = [
    {
      company: "Nothing Technology Limited",
      role: "Software Testing Intern",
      duration: "2024 — Present",
      achievement:
        "Executed functional testing and ran Industry-Level Beta Testing (ILBT) test cases across multiple concurrent product builds. Flashed and configured new firmware builds across test devices for consistent, repeatable testing conditions.",
    },
    {
      company: "Nothing Technology Limited",
      role: "Beta Tester (User Acceptance Testing)",
      duration: "2024 — Present",
      achievement:
        "Executed UAT testing on 100+ pre-release mobile/IoT builds, identifying 200+ bugs and contributing to a 60% improvement in software stability. Uncovered blocker-level issues in Face ID recognition and critical camera stability bugs during EVT/DVT testing stages.",
    },
  ];

  const projects = [
    {
      name: "AI-Based YouTube Comment Analyzer",
      description: "A sentiment analysis tool that classifies YouTube comments as Positive, Negative, or Neutral.",
      tech: "BERT, NLP, YouTube Data API",
      link: "#",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#F7F4EE", color: "#242321" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 backdrop-blur-sm bg-[#F7F4EE]/90 border-b border-[#E4DFD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-lg sm:text-xl text-[#242321]">Keshav Sharma</span>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#about" className="text-[#716E68] hover:text-[#A66A52] transition-colors">About</a>
            <a href="#skills" className="text-[#716E68] hover:text-[#A66A52] transition-colors">Skills</a>
            <a href="#experience" className="text-[#716E68] hover:text-[#A66A52] transition-colors">Experience</a>
            <a href="#projects" className="text-[#716E68] hover:text-[#A66A52] transition-colors">Projects</a>
            <a href="#education" className="text-[#716E68] hover:text-[#A66A52] transition-colors">Education</a>
            <a href="#contact" className="text-[#716E68] hover:text-[#A66A52] transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 order-2 md:order-1 text-center md:text-left">
          <p className="text-sm sm:text-base font-medium text-[#A66A52] mb-2 tracking-wide uppercase">
            Quality Analyst
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#242321] mb-4 leading-tight">
            Hi, I'm Keshav Sharma
          </h1>
          <p className="text-base sm:text-lg text-[#716E68] mb-6 max-w-md mx-auto md:mx-0">
            "Finding what breaks, before it ships."
          </p>
          <div className="flex gap-3 justify-center md:justify-start">
            <a
              href="#projects"
              className="px-5 py-2.5 rounded-full bg-[#383532] text-[#F7F4EE] font-medium text-sm hover:bg-[#242220] transition-colors shadow-sm"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-full border-2 border-[#383532] text-[#383532] font-medium text-sm hover:bg-[#EEE8DB] transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <canvas
            ref={canvasRef}
            className="w-full h-64 sm:h-80 md:h-96 rounded-2xl"
            style={{ touchAction: "none" }}
          />
          <p className="text-center text-xs text-[#A66A52] mt-1">Move your mouse — I'm watching</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-4">About Me</h2>
        <p className="text-[#716E68] leading-relaxed text-sm sm:text-base">
          I'm a final-year Computer Science Engineering student and QA/Software Testing enthusiast, currently
          interning at Nothing Technology, where I test mobile and IoT products before they reach the market.
          I'm passionate about catching what others miss — over the past year and a half, I've tested 100+ builds,
          found 200+ bugs, and helped push software stability up by 60%. I'm growing from manual testing into
          automation and API testing, with a goal of becoming a well-rounded QA Engineer.
        </p>
      </section>

      {/* Skills */}
      <section id="skills" className="bg-[#F0EBE1] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-8">Skills</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{skill.name}</span>
                  <span>{skill.level}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#E4DFD3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#383532] rounded-full transition-all duration-700"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-white text-[#716E68] text-xs sm:text-sm font-medium rounded-full border border-[#E4DFD3] shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-8">Experience</h2>
        <div className="space-y-6">
          {experience.map((job, i) => (
            <div
              key={i}
              className="bg-white/70 border border-[#E4DFD3] rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 gap-1">
                <h3 className="font-semibold text-lg text-[#242321]">{job.role}</h3>
                <span className="text-xs sm:text-sm text-[#A66A52] font-medium">{job.duration}</span>
              </div>
              <p className="text-sm font-medium text-[#716E68] mb-2">{job.company}</p>
              <p className="text-sm text-[#716E68] leading-relaxed">{job.achievement}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="bg-[#F0EBE1] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-8">Projects</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.name}
                className="bg-white rounded-xl p-5 border border-[#E4DFD3] flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 sm:col-span-2 lg:col-span-1"
              >
                <h3 className="font-semibold text-lg text-[#242321] mb-2">{project.name}</h3>
                <p className="text-sm text-[#716E68] mb-3 flex-1 leading-relaxed">{project.description}</p>
                <p className="text-xs text-[#A66A52] mb-3 font-medium">{project.tech}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#716E68] hover:text-[#242321] inline-flex items-center gap-1 transition-colors"
                >
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-8">Education</h2>
        <div className="bg-white/70 border border-[#E4DFD3] rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
            <h3 className="font-semibold text-lg text-[#242321]">B.Tech in Computer Science Engineering</h3>
            <span className="text-sm text-[#A66A52] font-medium">2022 — 2026</span>
          </div>
          <p className="text-sm text-[#716E68] mt-1">Galgotias University</p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#F0EBE1] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#242321] mb-8">Contact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-[#716E68] mb-4 leading-relaxed">
                Have a project in mind or just want to say hi? My inbox is always open.
              </p>
              <div className="space-y-3 text-sm">
                <a href="mailto:keshav.sharma@email.com" className="flex items-center gap-2 text-[#716E68] hover:text-[#242321] transition-colors">
                  <span className="font-medium">Email:</span> keshav.sharma@email.com
                </a>
                <a href="https://www.linkedin.com/in/keshavsharmalink" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#716E68] hover:text-[#242321] transition-colors">
                  <span className="font-medium">LinkedIn:</span> linkedin.com/in/keshavsharmalink
                </a>
                <a href="https://github.com/keshavsharma" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#716E68] hover:text-[#242321] transition-colors">
                  <span className="font-medium">GitHub:</span> github.com/keshavsharma
                </a>
                <p className="flex items-center gap-2 text-[#716E68]">
                  <span className="font-medium">Phone:</span> +91-XXXXXXXXXX
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-[#E4DFD3] space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#242321] mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#A66A52] transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#242321] mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#A66A52] transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#242321] mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#A66A52] transition-shadow resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#383532] text-[#F7F4EE] font-medium text-sm hover:bg-[#242220] transition-colors"
              >
                Send Message
              </button>
              {submitted && (
                <p className="text-xs text-green-600 text-center pt-1">
                  Thanks for reaching out! I'll get back to you soon.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-[#A66A52] py-6 border-t border-[#E4DFD3]">
        © {new Date().getFullYear()} Keshav Sharma. Built with React & Three.js.
      </footer>
    </div>
  );
}
