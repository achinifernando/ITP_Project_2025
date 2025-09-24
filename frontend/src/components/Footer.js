import React from "react";
import "../CSS/footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle} from "@fortawesome/free-brands-svg-icons";
import { faLocationDot, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';



function Footer() {
  return (
    <footer className="footer">
      {/* Social media section */}
      <section className="footer-social">
        <div className="footer-social-left">
          <span>GET CONNECTED WITH US ON SOCIAL NETWORKS:</span>
        </div>

        <div className="footer-social-right">
          <a
            href="https://www.facebook.com/p/Nimal-engineering-lorrybody-100063652736748/"
            className="social-link"
          >
           <FontAwesomeIcon icon={faFacebook} size="2x" />
          Facebook
          </a>
          <a
            href="https://ethin.lk/item/nimal-engineering-works/"
            className="social-link"
          >
            <FontAwesomeIcon icon={faGoogle} size="2x" />
          Google
          </a>
        </div>
      </section>

      {/* Links & Info */}
      <section className="footer-links">
        <div className="footer-container">
          {/* Company Info */}
          <div className="footer-col">
            <h6>NIMAL ENGINEERING WORKS & LORRY BODY BUILDERS</h6>
            <p>
              Pioneers in Lorry Body Building using Japanese Technology
            </p>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <h6>HOME</h6>
            <p><a href="#">PRODUCTS</a></p>
            <p><a href="#">SERVICES</a></p>
            <p><a href="#">ABOUT</a></p>
            <p><a href="#">CONTACT</a></p>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h6>CONTACT</h6>
            <p>
              <FontAwesomeIcon icon={faLocationDot} />  NO 483, Kandy Road,Aluthgama Bogamuwa, Yakkala <br/>
              <FontAwesomeIcon icon={faEnvelope}/>nimalengineeringworks16@gmail.com<br/>
              <FontAwesomeIcon icon={faPhone}  /> 0776336363 /0332050196
            </p>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2025 Copyright
      </div>
    </footer>
  );
}

export default Footer;
