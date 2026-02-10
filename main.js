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

setupPrintHandlers();
setupStarfield();
setupScrollReveal();
