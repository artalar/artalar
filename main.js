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

const SVG_NS = "http://www.w3.org/2000/svg";
const STARFIELD_SHOOTING_COUNT = 14;
const STARFIELD_SHOOT_TRAVEL_SCALE = 85;

const setupStarfield = () => {
  const starfield = document.getElementById("starfield");
  if (!starfield) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const fullCircle = Math.PI * 2;

  const defs = document.createElementNS(SVG_NS, "defs");
  const starsLayer = document.createElementNS(SVG_NS, "g");
  const shootingLayer = document.createElementNS(SVG_NS, "g");
  starfield.replaceChildren(defs, starsLayer, shootingLayer);

  let layoutWidth = 0;
  let layoutHeight = 0;
  let shootingGradCounter = 0;

  const syncViewBox = () => {
    const width = window.innerWidth;
    const height = document.documentElement.scrollHeight;
    layoutWidth = width;
    layoutHeight = height;
    starfield.setAttribute("viewBox", `0 0 ${width} ${height}`);
    starfield.setAttribute("preserveAspectRatio", "none");
  };

  const fillShootingLayer = () => {
    const baseCycleSeconds = 18;
    for (let index = 0; index < STARFIELD_SHOOTING_COUNT; index++) {
      const velocityX = (Math.random() - 0.3) * 6;
      const velocityY = Math.random() * 3 + 1.5;
      const tailLength = Math.random() * 80 + 40;
      const tailEndX = -(velocityX * tailLength) / 6;
      const tailEndY = -(velocityY * tailLength) / 6;

      const gradientId = `shoot-grad-${shootingGradCounter}`;
      shootingGradCounter += 1;
      const gradient = document.createElementNS(SVG_NS, "linearGradient");
      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      gradient.setAttribute("x1", "0");
      gradient.setAttribute("y1", "0");
      gradient.setAttribute("x2", String(tailEndX));
      gradient.setAttribute("y2", String(tailEndY));

      const stopNear = document.createElementNS(SVG_NS, "stop");
      stopNear.setAttribute("offset", "0%");
      stopNear.setAttribute("stop-color", "rgb(34, 211, 238)");
      stopNear.setAttribute("stop-opacity", "0.9");

      const stopMid = document.createElementNS(SVG_NS, "stop");
      stopMid.setAttribute("offset", "30%");
      stopMid.setAttribute("stop-color", "rgb(255, 255, 255)");
      stopMid.setAttribute("stop-opacity", "0.6");

      const stopFar = document.createElementNS(SVG_NS, "stop");
      stopFar.setAttribute("offset", "100%");
      stopFar.setAttribute("stop-color", "rgb(255, 255, 255)");
      stopFar.setAttribute("stop-opacity", "0");

      gradient.append(stopNear, stopMid, stopFar);
      defs.appendChild(gradient);

      const tailLine = document.createElementNS(SVG_NS, "line");
      tailLine.setAttribute("stroke", `url(#${gradientId})`);
      tailLine.setAttribute("stroke-width", "1.5");
      tailLine.setAttribute("stroke-linecap", "round");
      tailLine.setAttribute("x1", "0");
      tailLine.setAttribute("y1", "0");
      tailLine.setAttribute("x2", String(tailEndX));
      tailLine.setAttribute("y2", String(tailEndY));

      const head = document.createElementNS(SVG_NS, "circle");
      head.setAttribute("cx", "0");
      head.setAttribute("cy", "0");
      head.setAttribute("r", "1.5");
      head.setAttribute("fill", "rgb(34, 211, 238)");

      const motionGroup = document.createElementNS(SVG_NS, "g");
      motionGroup.classList.add("starfield-shooting");
      motionGroup.append(tailLine, head);

      const travelXpx = velocityX * STARFIELD_SHOOT_TRAVEL_SCALE;
      const travelYpx = velocityY * STARFIELD_SHOOT_TRAVEL_SCALE;
      motionGroup.style.setProperty("--shoot-travel-x", `${travelXpx}px`);
      motionGroup.style.setProperty("--shoot-travel-y", `${travelYpx}px`);

      const cycleJitter = baseCycleSeconds + (Math.random() - 0.5) * 8;
      motionGroup.style.setProperty("--shoot-cycle", `${cycleJitter}s`);

      const delaySpread =
        (index / STARFIELD_SHOOTING_COUNT) * cycleJitter +
        Math.random() * 4 -
        cycleJitter;
      motionGroup.style.setProperty("--shoot-delay", `${delaySpread}s`);

      const anchor = document.createElementNS(SVG_NS, "g");
      anchor.setAttribute(
        "transform",
        `translate(${Math.random() * layoutWidth} ${Math.random() * layoutHeight * 0.42})`,
      );
      anchor.appendChild(motionGroup);
      shootingLayer.appendChild(anchor);
    }
  };

  const rebuild = () => {
    syncViewBox();
    starsLayer.replaceChildren();
    defs.replaceChildren();
    shootingLayer.replaceChildren();
    shootingGradCounter = 0;

    const area = layoutWidth * window.innerHeight;
    const starCount = Math.min(200, Math.floor(area / 10_000));

    for (let i = 0; i < starCount; i++) {
      const hue = Math.random() > 0.85 ? (Math.random() > 0.5 ? 190 : 270) : 0;
      const fill = hue > 0 ? `hsl(${hue}, 70%, 80%)` : "#ffffff";
      const baseOpacity = Math.random() * 0.6 + 0.2;
      const twinkleSpeed = Math.random() * 0.03 + 0.008;
      const radius = Math.random() * 1.2 + 0.3;

      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(Math.random() * layoutWidth));
      circle.setAttribute("cy", String(Math.random() * layoutHeight));
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", fill);
      circle.classList.add("starfield-star");

      if (prefersReducedMotion) {
        const steadyOpacity = baseOpacity * 0.65;
        circle.style.opacity = String(steadyOpacity);
      } else {
        const periodSec = fullCircle / (twinkleSpeed * 1000);
        circle.style.setProperty("--star-op-min", String(baseOpacity * 0.3));
        circle.style.setProperty("--star-op-max", String(baseOpacity));
        circle.style.animationDuration = `${periodSec}s`;
        circle.style.animationDelay = `-${Math.random() * periodSec}s`;
      }

      starsLayer.appendChild(circle);
    }

    if (!prefersReducedMotion) {
      fillShootingLayer();
    }
  };

  rebuild();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 200);
  });

  const resizeObserver = new ResizeObserver(rebuild);
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
