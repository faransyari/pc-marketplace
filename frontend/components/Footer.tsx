import React from 'react';

const Footer: React.FC = () => (
    <footer style={{
        width: '100%',
        padding: '1rem 0',
        background: '#f5f5f5',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#555',
        borderTop: '1px solid #e0e0e0'
    }}>
        © {new Date().getFullYear()} PC Marketplace. All rights reserved.
    </footer>
);

export default Footer;