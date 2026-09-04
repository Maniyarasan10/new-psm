import { useState, type FormEvent } from 'react';
import { PageHero } from '../components/ui';
import Seo from '../components/Seo';
import { COMPANY, CONTACT } from '../lib/siteContent';

const ENQUIRY_OPTIONS = [
  'Digital Solution',
  'Product Partnership',
  'Product Enquiry',
  'Careers',
  'General',
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <Seo
        title="Contact Problem Solving Mind | Start a Conversation"
        description="Have a problem worth solving? Contact Problem Solving Mind about digital solutions, product partnerships, product enquiries or careers. Email problemsolvingminds@gmail.com."
        path="/contact"
      />

      <PageHero
        eyebrow="Contact"
        title="Have a Problem Worth Solving?"
      >
        <p>Tell us what you're trying to solve. We'll help you explore what technology can do.</p>
        <p>You don't need to arrive with a complete technical specification. Start with the problem. Tell us: What are you trying to achieve? What is currently difficult? Who uses the process or product? What would a successful outcome look like? Is there an existing system we need to work with?</p>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* ── Left ──────────────────────────────────────── */}
            <aside className="contact-aside">
              <div className="contact-card">
                <h3 className="h3">Contact Details</h3>
                <p>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </p>
                <p>
                  <a href="tel:+919360207861">{COMPANY.phone1}</a>
                  {COMPANY.phone2 && <span> · </span>}
                  {COMPANY.phone2 && <a href="tel:+917339386911">{COMPANY.phone2}</a>}
                </p>
                <p>{COMPANY.name}</p>
              </div>

              <div className="contact-card">
                <h3 className="h3">Enquiry Types</h3>
                <ul className="check-list">
                  {CONTACT.enquiryTypes.map((type) => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* ── Right ─────────────────────────────────────── */}
            {submitted ? (
              <div className="contact-form">
                <p className="lead">{CONTACT.success}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" />
                  </div>
                  <div className="field">
                    <label htmlFor="company">Company/Organization</label>
                    <input id="company" name="company" type="text" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="enquiryType">Enquiry Type</label>
                  <select id="enquiryType" name="enquiryType" defaultValue="" required>
                    <option value="" disabled>
                      Select an enquiry type
                    </option>
                    {ENQUIRY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="problem">What problem are you trying to solve?</label>
                  <textarea id="problem" name="problem" required />
                </div>
                <div className="field">
                  <label htmlFor="process">Current process/system</label>
                  <textarea id="process" name="process" />
                </div>
                <div className="field">
                  <label htmlFor="outcome">Expected outcome</label>
                  <textarea id="outcome" name="outcome" />
                </div>
                <button className="btn btn-primary" type="submit">
                  Send Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
