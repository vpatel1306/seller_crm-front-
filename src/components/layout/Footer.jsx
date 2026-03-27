import { FiPhone, FiMail, FiGlobe, FiCalendar, FiClock, FiFileText, FiHelpCircle, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { SiFlipkart } from 'react-icons/si';
import { TbBuildingStore } from 'react-icons/tb';

const activation = {
  renewDate:  '16 Mar 2026',
  expireDate: '15 Mar 2027',
  leftDays:   344,
};

export default function Footer() {
  return (
    <footer className="ft-root">
      <div className="ft-inner">

        {/* Col 1 — Logo */}
        <div className="ft-col ft-left">
          <div className="ft-logo-box">
            <TbBuildingStore size={36} className="ft-logo-icon" />
            <div>
              <div className="ft-logo-name">Meesho Seller</div>
              <div className="ft-logo-tag">Insight CRM</div>
            </div>
          </div>
          <p className="ft-tagline">Empowering sellers with smart insights &amp; analytics.</p>
        </div>

        <div className="ft-vdivider" />

        {/* Col 2 — Site Info */}
        <div className="ft-col ft-center">
          <div className="ft-site-name">Seller Insight Pro</div>
           <div className="ft-info-row"><span>📍 Surat, Gujarat — 395001</span></div>
          <div className="ft-info-row"><FiMail size={13} /><span>support@sellerinsight.in</span></div>
          <div className="ft-info-row"><FiGlobe size={13} /><a href="https://sellerinsight.in" target="_blank" rel="noreferrer">www.sellerinsight.in</a></div>
        </div>

        <div className="ft-vdivider" />

        {/* Col 3 — Contact + Platforms */}
        <div className="ft-col">
          <div className="ft-col-title">Contact</div>
          <div className="ft-contact-row">
            <FiPhone size={13} /><span>+91 12345 67890</span>
          </div>
          <div className="ft-contact-row">
            <FiPhone size={13} /><span>+91 11111 22222</span>
          </div>
          <div className="ft-platforms">
            <a href="https://meesho.com" target="_blank" rel="noreferrer" className="ft-platform-btn ft-meesho">
              <FiShoppingBag size={13} /> Meesho
            </a>
            <a href="https://myntra.com" target="_blank" rel="noreferrer" className="ft-platform-btn ft-myntra">
              <FiShoppingBag size={13} /> Myntra
            </a>
            <a href="https://flipkart.com" target="_blank" rel="noreferrer" className="ft-platform-btn ft-flipkart">
              <SiFlipkart size={13} /> Flipkart
            </a>
          </div>
        </div>

        <div className="ft-vdivider" />

        {/* Col 4 — Activation Info */}
        <div className="ft-col">
          <div className="ft-col-title">Activation Info</div>
          <div className="ft-act-row">
            <FiRefreshCw size={13} className="ft-green" />
            <div><div className="ft-act-label">Renew Date</div><div className="ft-act-val">{activation.renewDate}</div></div>
          </div>
          <div className="ft-act-row">
            <FiCalendar size={13} className="ft-orange" />
            <div><div className="ft-act-label">Expire Date</div><div className="ft-act-val">{activation.expireDate}</div></div>
          </div>
          <div className="ft-act-row">
            <FiClock size={13} className="ft-purple" />
            <div><div className="ft-act-label">Days Left</div><div className="ft-act-val ft-days">{activation.leftDays} days</div></div>
          </div>
        </div>

        <div className="ft-vdivider" />

        {/* Col 5 — Buttons */}
        <div className="ft-col ft-col-btns">
          <div className="ft-col-title">Quick Actions</div>
          <button className="ft-btn ft-btn-invoice"><FiFileText size={14} /> GST Invoice</button>
          <button className="ft-btn ft-btn-help"><FiHelpCircle size={14} /> Self Help</button>
        </div>

      </div>

      <div className="ft-bottom">
        <span>© {new Date().getFullYear()} Seller Insight Pro. All rights reserved.</span>
      </div>
    </footer>
  );
}
