import React from 'react';
import '../style/landingpage.css'


import MouseTrail from "./mousetraileffect";

function landingpage() {
  return (
    
    <div style={{ height: "100vh", backgroundColor: "white", overflow:"hidden" }}>
     
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
        <MouseTrail />
    </div>
  );
}

export default landingpage;