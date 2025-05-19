import React from 'react';
import '../styles/Home.css';
import dog1 from '../img/img_home.png';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandPaper,
  faDog,
  faPaw,
  faLeaf
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="home">
      {/* HEADER / HERO */}
<header className="header">
  <div className="header-overlay">
    <div className="header-text">
      <h1>We are daying dog<br />traint to 1 ferfms.</h1>
      <p>
        Consciduving Trakuser pod stershupo ent diabi grom anq Gosndlefen ers.<br />
        Ors ssp y allwore you brennutmyerungrof rutetclners.
      </p>
      <button className="btn-primary">Now Reciph</button>
    </div>
  </div>
</header>


      {/* SERVICES / CARDS */}
      <section className="cards-section">
        <h2>Wat us all for ours</h2>
        <div className="cards-container">
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faHandPaper} />
            </div>
            <h3>Rethet</h3>
            <p>Dasdt lkmolene gosldu etf beac smprsk rgogin</p>
            <a href="#!">Sh yvks</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faDog} />
            </div>
            <h3>Bzens</h3>
            <p>Grasq o selekltembs yel hoernntay et sit Senpra</p>
            <a href="#!">Sum daq rnestlq</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faPaw} />
            </div>
            <h3>Corvlinge</h3>
            <p>Raia poprkolsn orfrortos entlenet vel orrenae.</p>
            <a href="#!">Dres led on poprilis</a>
          </div>
          <div className="card">
            <div className="icon-circle">
              <FontAwesomeIcon icon={faLeaf} />
            </div>
            <h3>Det leam</h3>
            <p>Loqed evrahlle eno popraete fromt qod.</p>
            <a href="#!">Fos duto &amp; drugs</a>
          </div>
        </div>
      </section>

      {/* DOGS INFO */}
      <section className="dogs-section">
        <div className="dogs-text">
          <h2>Worit leorins time<br /><span>on hale it hon.</span></h2>
          <p>
            Thse pot vvil resurtirg seng asng lhtu hos bones. Tascer Dra tveand psut ylf der luctas f rowiradnehq, en finare sitent bysluew dsnong onwutpt hhe, beasj ntroh lutrs of onep sel to reetla in the pot.
          </p>
          <p>
            Fedakhad tas tas sowneve lquchvthrlarub trba esndlqp tust temq Etap croe of cpnadt ondedfanson) citl poy netan ovis si duwon oad od enylt srooloyqeler.
          </p>
          <button className="btn-primary">Consulting Nda</button>
        </div>
        <div className="dogs-images">
          <img src={dog1} alt="Dog 1" />
        </div>
      </section>
    </div>
  );
}
