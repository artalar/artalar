const setupPrintHandlers = () => {
  const toggleTimelineDetails = (isOpen) => {
    document.querySelectorAll(".timeline-details").forEach((detail) => {
      if (isOpen) {
        detail.setAttribute("open", "");
        return;
      }
      detail.removeAttribute("open");
    });
  };

  const revealAllForPrint = () => {
    document
      .querySelectorAll(".section, .circuit-divider, .timeline-item")
      .forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
  };

  window.addEventListener("beforeprint", () => {
    toggleTimelineDetails(true);
    revealAllForPrint();
  });
  window.addEventListener("afterprint", () => toggleTimelineDetails(false));
};

const setupStarfield = () => {
  const starCanvas = document.getElementById("starfield");
  if (!starCanvas) {
    return;
  }

  const starContext = starCanvas.getContext("2d");
  if (!starContext) {
    return;
  }

  const stars = [];
  const shootingStars = [];
  const fullCircle = Math.PI * 2;
  let animationFrame;

  const resizeCanvas = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    starCanvas.width = window.innerWidth;
    starCanvas.height = scrollHeight;
  };

  const createStars = () => {
    const area = starCanvas.width * window.innerHeight;
    const starCount = Math.min(200, Math.floor(area / 10_000));
    stars.length = 0;

    for (let i = 0; i < starCount; i++) {
      const hue = Math.random() > 0.85 ? (Math.random() > 0.5 ? 190 : 270) : 0;
      const color = hue > 0 ? `hsl(${hue}, 70%, 80%)` : "white";

      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        radius: Math.random() * 1.2 + 0.3,
        baseOpacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        phase: Math.random() * fullCircle,
        color,
      });
    }
  };

  const renderStars = (time) => {
    const canvasWidth = starCanvas.width;
    const canvasHeight = starCanvas.height;
    starContext.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const star of stars) {
      const twinkle =
        Math.sin(time * star.twinkleSpeed + star.phase) * 0.35 + 0.65;
      const opacity = star.baseOpacity * twinkle;

      starContext.globalAlpha = opacity;
      starContext.fillStyle = star.color;
      starContext.beginPath();
      starContext.arc(star.x, star.y, star.radius, 0, fullCircle);
      starContext.fill();
    }

    starContext.globalAlpha = 1;
    if (Math.random() < 0.003) {
      shootingStars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight * 0.4,
        velocityX: (Math.random() - 0.3) * 6,
        velocityY: Math.random() * 3 + 1.5,
        life: 1.0,
        tailLength: Math.random() * 80 + 40,
      });
    }

    if (shootingStars.length > 0) {
      starContext.lineWidth = 1.5;

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const shootingStar = shootingStars[i];
        shootingStar.x += shootingStar.velocityX;
        shootingStar.y += shootingStar.velocityY;
        shootingStar.life -= 0.012;

        if (shootingStar.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailEndX =
          shootingStar.x -
          (shootingStar.velocityX * shootingStar.tailLength) / 6;
        const tailEndY =
          shootingStar.y -
          (shootingStar.velocityY * shootingStar.tailLength) / 6;

        const gradient = starContext.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          tailEndX,
          tailEndY,
        );
        gradient.addColorStop(
          0,
          `rgba(34, 211, 238, ${shootingStar.life * 0.9})`,
        );
        gradient.addColorStop(
          0.3,
          `rgba(255, 255, 255, ${shootingStar.life * 0.6})`,
        );
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        starContext.strokeStyle = gradient;
        starContext.beginPath();
        starContext.moveTo(shootingStar.x, shootingStar.y);
        starContext.lineTo(tailEndX, tailEndY);
        starContext.stroke();

        starContext.fillStyle = `rgba(34, 211, 238, ${shootingStar.life})`;
        starContext.beginPath();
        starContext.arc(shootingStar.x, shootingStar.y, 1.5, 0, fullCircle);
        starContext.fill();
      }
    }

    starContext.globalAlpha = 1;
    animationFrame = requestAnimationFrame(renderStars);
  };

  resizeCanvas();
  createStars();
  requestAnimationFrame(renderStars);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      createStars();
    }, 200);
  });

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  resizeObserver.observe(document.documentElement);
};

const setupScrollReveal = () => {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".section, .circuit-divider").forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(24px)";
    element.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    sectionObserver.observe(element);
  });

  document.querySelectorAll(".timeline-item").forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateX(-16px)";
    item.style.transition = `opacity 0.5s ease ${
      index * 0.1
    }s, transform 0.5s ease ${index * 0.1}s`;

    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
          }
        });
      },
      { threshold: 0.15 },
    );
    itemObserver.observe(item);
  });
};

const BRAILLE_SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const STEP_DURATION_MS = 2000;
const SPINNER_INTERVAL_MS = 80;
const SUCCESS_HOLD_MS = 2000;

const PIPELINE_STEPS = [
  "Plan the approach",
  "Write tests for expected behavior",
  "Write code to pass tests",
  "Fix failing tests",
  "Review and clean up",
];

const FEATURES = [
  "dark-mode toggle",
  "search with filters",
  "notification preferences",
  "keyboard shortcuts",
  "data export to CSV",
  "user onboarding flow",
  "real-time collaboration",
  "accessibility audit",
];

const setupAsciiTerminal = () => {
  const body = document.getElementById("ai-terminal-body");
  if (!body) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const featureSpan = document.createElement("span");
  featureSpan.id = "at-feature";

  const promptIcon = document.createElement("span");
  promptIcon.className = "at-status at-prompt";
  promptIcon.textContent = ">";

  const promptLabel = document.createElement("span");
  promptLabel.className = "at-prompt";
  promptLabel.textContent = " @agent implement ";

  const promptLine = document.createElement("span");
  promptLine.className = "at-line at-prompt-line";
  promptLine.appendChild(promptIcon);
  promptLine.appendChild(promptLabel);
  promptLine.appendChild(featureSpan);

  const blankLine = () => {
    const span = document.createElement("span");
    span.className = "at-line at-blank";
    return span;
  };

  const stepLines = PIPELINE_STEPS.map((label) => {
    const statusSpan = document.createElement("span");
    statusSpan.className = "at-status";

    const lineSpan = document.createElement("span");
    lineSpan.className = "at-line at-step";
    lineSpan.appendChild(statusSpan);
    lineSpan.appendChild(document.createTextNode(" " + label));
    lineSpan.dataset.step = String(PIPELINE_STEPS.indexOf(label));
    return { line: lineSpan, status: statusSpan };
  });

  const successStatus = document.createElement("span");
  successStatus.className = "at-status";

  const successText = document.createElement("span");
  successText.textContent = "";

  const successLine = document.createElement("span");
  successLine.className = "at-line";
  successLine.id = "at-success";
  successLine.style.visibility = "hidden";
  successLine.appendChild(successStatus);
  successLine.appendChild(successText);

  body.appendChild(promptLine);
  body.appendChild(blankLine());
  stepLines.forEach(({ line }) => body.appendChild(line));
  body.appendChild(blankLine());
  body.appendChild(successLine);

  if (prefersReducedMotion) {
    featureSpan.textContent = FEATURES[0];
    stepLines.forEach(({ status }) => {
      status.textContent = "✓";
      status.classList.add("at-ok");
    });
    successStatus.textContent = "✓";
    successStatus.classList.add("at-ok");
    successText.textContent = " " + FEATURES[0] + " shipped";
    successLine.classList.add("at-success");
    successLine.style.visibility = "";
    return;
  }

  let currentFeatureIndex = 0;
  let activeStep = 0;
  let spinnerFrame = 0;
  let lastSpinnerUpdate = 0;
  let stepStartTime = 0;
  let phase = "steps";
  let successShownAt = 0;
  let animationFrameId = 0;

  const setStepStatus = (index, char) => {
    stepLines[index].status.textContent = char;
    stepLines[index].status.classList.toggle("at-ok", char === "✓");
    stepLines[index].status.classList.toggle("at-spin", char !== "✓" && char !== "·");
  };

  const resetCycle = () => {
    currentFeatureIndex = (currentFeatureIndex + 1) % FEATURES.length;
    const feature = FEATURES[currentFeatureIndex];
    featureSpan.textContent = feature;

    stepLines.forEach((_, i) => {
      setStepStatus(i, "·");
    });
    activeStep = 0;
    stepStartTime = performance.now();
    lastSpinnerUpdate = performance.now();
    phase = "steps";
    successStatus.textContent = "";
    successText.textContent = "";
    successLine.style.visibility = "hidden";
    successLine.classList.remove("at-success");
  };

  const tick = (now) => {
    if (phase === "steps") {
      const elapsed = now - stepStartTime;
      if (activeStep < stepLines.length) {
        if (now - lastSpinnerUpdate >= SPINNER_INTERVAL_MS) {
          spinnerFrame++;
          lastSpinnerUpdate = now;
        }
        setStepStatus(activeStep, BRAILLE_SPINNER[spinnerFrame % BRAILLE_SPINNER.length]);

        if (elapsed >= STEP_DURATION_MS) {
          setStepStatus(activeStep, "✓");
          activeStep++;
          stepStartTime = now;
        }
      } else {
        successStatus.textContent = "✓";
        successStatus.classList.add("at-ok");
        successText.textContent = " " + FEATURES[currentFeatureIndex] + " shipped";
        successLine.classList.add("at-success");
        successLine.style.visibility = "";
        phase = "success";
        successShownAt = now;
      }
    } else if (phase === "success") {
      if (now - successShownAt >= SUCCESS_HOLD_MS) {
        resetCycle();
      }
    }

    animationFrameId = requestAnimationFrame(tick);
  };

  featureSpan.textContent = FEATURES[0];
  stepLines.forEach((_, i) => setStepStatus(i, "·"));
  stepStartTime = performance.now();
  animationFrameId = requestAnimationFrame(tick);
};

setupPrintHandlers();
setupStarfield();
setupScrollReveal();
setupAsciiTerminal();
