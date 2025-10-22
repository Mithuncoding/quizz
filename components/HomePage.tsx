import React, { useRef, useEffect } from 'react';
import { BarChartIcon, BookOpenIcon, FileTextIcon, ZapIcon } from './icons';

interface HomePageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; accentColor: string }> = ({ icon, title, children, accentColor }) => (
    <div className="relative group p-6 rounded-2xl bg-slate-800/60 border border-slate-700 hover:-translate-y-2 transition-transform duration-300 ease-in-out overflow-hidden">
        <div className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,${accentColor}_0,transparent_50%)] animate-aurora`}></div>
        <div className="relative z-10">
            <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center text-white bg-slate-900 border border-slate-700`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400">{children}</p>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; }> = ({ quote, name, role }) => (
  <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
    <p className="text-slate-300 mb-4">"{quote}"</p>
    <div>
      <p className="font-bold text-white">{name}</p>
      <p className="text-sm text-slate-400">{role}</p>
    </div>
  </div>
);

const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 70;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = event.clientX;
            mouse.current.y = event.clientY;
        };
        
        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number;
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.size > 0.1) this.size -= 0.01;
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        
        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                                 + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(148, 163, 184, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connect();
            animationFrameId = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}


const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full bg-slate-900">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-40 h-screen flex items-center justify-center flex-col">
        <ParticleCanvas />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 animate-fade-in-down">
            Master Anything, Faster.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
            The intelligent learning platform that transforms your documents and ideas into interactive quizzes, powered by next-generation AI.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-10 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:-translate-y-px shadow-lg hover:shadow-purple-500/30 animate-fade-in-up animation-delay-600"
          >
            Start Learning Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">An Unfair Advantage for Learners</h2>
            <p className="text-slate-400 mt-4 text-lg">Everything you need to master new subjects, faster.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<BookOpenIcon className="w-8 h-8 text-blue-400"/>} title="Topic-Based Quizzes" accentColor="#3b82f6">
              Simply enter a topic, and our AI will craft a relevant and challenging quiz for you in seconds.
            </FeatureCard>
            <FeatureCard icon={<FileTextIcon className="w-8 h-8 text-green-400"/>} title="Generate from PDFs" accentColor="#22c55e">
              Upload your study materials, lecture notes, or any PDF, and instantly turn them into interactive quizzes.
            </FeatureCard>
            <FeatureCard icon={<ZapIcon className="w-8 h-8 text-purple-400"/>} title="Dual Quiz Modes" accentColor="#a855f7">
              Choose 'Study Mode' for instant feedback or 'Test Mode' for a timed, real-exam experience.
            </FeatureCard>
            <FeatureCard icon={<BarChartIcon className="w-8 h-8 text-orange-400"/>} title="Performance Analytics" accentColor="#f97316">
              Review your results with detailed insights, including score, time taken, and question analysis.
            </FeatureCard>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 md:py-32 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
           <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">Trusted by Learners Worldwide</h2>
            <p className="text-slate-400 mt-4 text-lg">See how QuizMaster AI is revolutionizing study habits.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard name="Sarah J." role="Medical Student" quote="This tool is a lifesaver for digesting dense textbooks. The PDF-to-quiz feature is pure genius." />
            <TestimonialCard name="Mike R." role="Software Developer" quote="I use it to stay sharp on new frameworks. Generating a quick quiz on documentation is incredibly efficient." />
            <TestimonialCard name="Chloe T." role="High School Student" quote="My test scores have genuinely improved. The spaced repetition and AI tutor helped me finally understand chemistry." />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;