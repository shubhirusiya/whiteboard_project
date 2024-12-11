import React from 'react';
import '../style/landingpage.css'


import MouseTrail from "./mousetraileffect";

function landingpage() {
  return (
    
    <div style={{ minHeight:"100vh", backgroundColor: "white", overflow:"hidden" }}>
     
        <div className='intro'>
          <div className="textarea">
            <h1>Create,Design, Collab </h1>
            <br/>
          <p>
            Group with friends, design, innovate together<br/>
            with our real time collaborative Whiteboard!
            </p>
            <br />
        <div class="container">
          
  <button class="btn" data="Try Whiteboard"></button>
</div>
</div>
    <div className='pic'><img src="./pic1.avif" alt="" /></div>


        </div>
        <div className='intro'>
        <div className='pic'><img src="./doodle.png" alt="" /></div>

          <div className="textarea">
            <h1>Engage everyone</h1>
            <br/>
          <p>
          Collab with anyone, anywhere and start working 
            </p>
            <br />
      
          </div>


        </div>

        <div className='intro'>
        <div className='pic1'><img src="./note1.png" alt="" /></div>

          <div className="textarea">
            <h1>Study Together,Learn Together</h1>
            <br/>
          <p>
          Want to study and learn together ? Try the whiteboard now !
            </p>
            <br />
      
          </div>


        </div>
       
        <MouseTrail />
    </div>
  );
}

export default landingpage;