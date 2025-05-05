import React from 'react';
import '../styles/Produtos.css'; // crie esse CSS com o estilo idêntico da imagem

const Produtos = () => {
  return (
    <div className="produto-container">
      <aside className="filtros">
        <h3>CATEGORIES</h3>
        <ul>
          <li><input type="radio" name="category" /> Electronics</li>
          <li><input type="radio" name="category" /> NFT</li>
          <li><input type="radio" name="category" /> Jewellery</li>
          <li><input type="radio" name="category" /> Fashion</li>
          <li><input type="radio" name="category" /> Furniture</li>
        </ul>

        <h3>GENDER</h3>
        <ul>
          <li><input type="radio" name="gender" /> Men</li>
          <li><input type="radio" name="gender" /> Women</li>
          <li><input type="radio" name="gender" /> Unisex</li>
        </ul>

        <h3>COLORS</h3>
        <div className="colors">
          <span className="color black" />
          <span className="color red" />
          <span className="color blue" />
          <span className="color pink" />
          <span className="color yellow" />
          <span className="color white" />
        </div>

        <h3>SIZE</h3>
        <div className="sizes">
          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
            <button key={size}>{size}</button>
          ))}
        </div>

        <h3>PRICE</h3>
        <div className="prices">
          <label><input type="radio" name="price" /> 100</label>
          <label><input type="radio" name="price" /> 200</label>
          <label><input type="radio" name="price" /> 300</label>
        </div>

        <button className="reset">All Reset</button>
      </aside>

      <main className="produtos">
        {[
          { name: '3D™ wireless headset', old: '$500', price: '$400', tag: '20% OFF', img: 'headset1.png' },
          { name: 'PS2 Dualshock 2 Wireless Controller', old: '$49.99', price: '$29.99', tag: '40% OFF', img: 'ps2.png' },
          { name: 'Wired Keyboard & Mouse Combo Pack', old: '$55.63', price: '$32.99', tag: '41% OFF', img: 'keyboard.png' },
          { name: 'Logitech Streamcam', old: '$219', price: '$199', tag: '9% OFF', img: 'cam.png' },
          { name: '3D™ wireless headset', old: '$417', price: '$387', tag: '7% OFF', img: 'headset2.png' },
          { name: 'Bass Meets Clarity', old: '$400', price: '$233', tag: '42% OFF', img: 'speaker.png' },
          { name: 'Mouse Logitech', old: '$130', price: '$100', tag: '23% OFF', img: 'mouse.png' },
          { name: 'Playstation Controller', old: '$49.99', price: '$29.99', tag: '40% OFF', img: 'pscontroller.png' },
          { name: 'Zone Headphone', old: '$200', price: '$179', tag: '11% OFF', img: 'zone.png' }
        ].map((p, index) => (
          <div className="produto-card" key={index}>
            <span className="tag">{p.tag}</span>
            <img src={`images/${p.img}`} alt={p.name} />
            <h4>{p.name}</h4>
            <p><s>{p.old}</s> <strong>{p.price}</strong></p>
            <div className="dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        ))}

        <button className="load-more">Load more</button>
      </main>

      <section className="newsletter">
        <div>
          <h2>Get weekly update</h2>
          <form>
            <input type="email" placeholder="example@gmail.com" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
        <img src="images/newsletter-bg.png" alt="Newsletter" />
      </section>

      <footer className="rodape">
        <div className="rodape-item">
          <img src="icons/delivery.png" alt="Delivery" />
          <p>Fast & Secure Delivery<br /><span>Tell about your service.</span></p>
        </div>
        <div className="rodape-item">
          <img src="icons/moneyback.png" alt="Money Back" />
          <p>Money Back Guarantee<br /><span>Within 10 days.</span></p>
        </div>
        <div className="rodape-item">
          <img src="icons/return.png" alt="Return" />
          <p>24 Hour Return Policy<br /><span>No question ask.</span></p>
        </div>
        <div className="rodape-item">
          <img src="icons/support.png" alt="Support" />
          <p>Pro Quality Support<br /><span>24/7 live support.</span></p>
        </div>
      </footer>
    </div>
  );
};

export default Produtos;
