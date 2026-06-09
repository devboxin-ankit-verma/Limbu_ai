"use client";

export function ContactForm() {
  return (
    <form
      className="m-contact-form m-dominate-card"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = data.get("name");
        const email = data.get("email");
        const message = data.get("message");
        const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${message}`;
        window.location.href = `mailto:info@limbu.ai?subject=Limbu.ai%20Contact&body=${body}`;
      }}
    >
      <h3>Send a Message</h3>
      <label className="m-contact-field">
        <span>Name</span>
        <input type="text" name="name" required placeholder="Your name" />
      </label>
      <label className="m-contact-field">
        <span>Email</span>
        <input type="email" name="email" required placeholder="you@company.com" />
      </label>
      <label className="m-contact-field">
        <span>Message</span>
        <textarea name="message" rows={5} required placeholder="How can we help?" />
      </label>
      <button type="submit" className="m-btn m-btn-primary m-contact-submit">
        Send Message
      </button>
    </form>
  );
}
