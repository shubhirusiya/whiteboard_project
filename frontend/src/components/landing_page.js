import React, { useEffect, useRef } from 'react';
import '../style/landingpage.css';
import MouseTrail from "./mousetraileffect";
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const sectionRefs = useRef([]);
  const typedTextRefs = useRef([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          } else {
            entry.target.classList.remove('section-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    // Typed Animation
    typedTextRefs.current.forEach((textElement, index) => {
      if (textElement && index % 2 === 1) { // Only for paragraph texts
        const text = textElement.textContent;
        textElement.textContent = '';
        let charIndex = 0;
        
        const typeWriter = () => {
          if (charIndex < text.length) {
            textElement.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 50);
          }
        };
        
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              typeWriter();
            }
          },
          { threshold: 0.1 }
        );
        
        observer.observe(textElement);
      }
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="landing-container">
      <MouseTrail />
     
      <div 
        ref={(el) => sectionRefs.current[0] = el} 
        className='intro first-section'
      >
        <div className="textarea">
          <h1 ref={(el) => typedTextRefs.current[1] = el} className="constant-gradient-text">Create, Design, Collab</h1>
          <p ref={(el) => typedTextRefs.current[0] = el} className="description-text">
            Group with friends, design, innovate together <br/>
            with our real time collaborative Whiteboard!
          </p>
          <div className="container">
            <button className="btn animated-border" data="Try Whiteboard" onClick={() => navigate('/canvas')}>
              <span className="btn-content">Try Whiteboard</span>
            </button>
          </div>
        </div>
        <div className='pic'>
          <img src="./pic1.avif" alt="Collaboration Illustration" />
        </div>
      </div>

      <div 
        ref={(el) => sectionRefs.current[1] = el} 
        className='intro second-section'
      >
        <div className='pic second-pic'>
          <img src="./doodle.png" alt="Engagement Illustration" />
        </div>
        <div className="textarea second-text">
          <h1 ref={(el) => typedTextRefs.current[3] = el} className="constant-gradient-text">Engage Everyone</h1>
          <p ref={(el) => typedTextRefs.current[2] = el} className="description-text">
            Collab with anyone, anywhere and start working 
          </p>
        </div>
      </div>

      <div 
        ref={(el) => sectionRefs.current[2] = el} 
        className='intro third-section'
      >
        <div className='pic1'>
          <img src="./note1.png" alt="Study Illustration" />
        </div>
        <div className="textarea">
          <h1 ref={(el) => typedTextRefs.current[5] = el} className="constant-gradient-text">Study Together, Learn Together</h1>
          <p ref={(el) => typedTextRefs.current[4] = el} className="description-text">
            Want to study and learn together? 
            </p>
           <p> Try the whiteboard now!</p>
         
        </div>
      </div>
      <div
       ref={(el) => sectionRefs.current[2] = el} >

     
      <div className="fourthintro">
      <h1 ref={(el) => typedTextRefs.current[7] = el} className="constant-gradient-text">Start Collaborating Today!</h1>
        
      
      <div className="pics">
      <div className="pic3"><img src="./bg1.jpg" alt="" /></div>
      <div className="pic2"><img src="./note5.png" alt="" /></div>
      <div className="pic3"><img src="./bg1.jpg" alt="" /></div>
      </div>
      </div>
    </div>
    </div>
  );
}

export default LandingPage;