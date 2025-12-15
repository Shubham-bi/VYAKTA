import React from "react";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Navigation */}
            {/* Navigation handled by PublicLayout */}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-extrabold mb-6 text-indigo-900 text-center">About Us</h1>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        At VYAKTA, we believe communication is a fundamental human right. Our mission is to bridge the gap between sign language users and non-signers through innovative technology.
                    </p>

                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        Founded with the vision of creating a more inclusive world, our platform leverages advanced AI to provide real-time translation services, making meetings, social interactions, and professional collaborations accessible to everyone.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">Our Vision</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        To empower every individual to express themselves freely and be understood, regardless of the language or mode of communication they use.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
