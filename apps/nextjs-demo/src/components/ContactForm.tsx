import { Text, Field, withDatasourceCheck } from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import { useState } from 'react';
import styles from './ContactForm.module.css';

type ContactFormProps = ComponentProps & {
  fields: {
  };
};

const ContactForm = (props: ContactFormProps): JSX.Element => {


  const [formData, setFormData] = useState({
    title: '',
    visitorId: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workflowId: "{E152A320-A100-4A67-BD55-0F99691F58D6}"
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitStatus('success');
      setFormData({ title: '', visitorId: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev:any) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.contactForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="visitorId">Visitor ID</label>
          <input
            type="text"
            id="visitorId"
            name="visitorId"
            value={formData.visitorId}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className={styles.formTextarea}
            rows={4}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {submitStatus === 'success' && (
          <div className={styles.successMessage}>Message sent successfully!</div>
        )}
        {submitStatus === 'error' && (
          <div className={styles.errorMessage}>Failed to send message. Please try again.</div>
        )}
      </form>
    </div>
  );

 
};

export default ContactForm;
