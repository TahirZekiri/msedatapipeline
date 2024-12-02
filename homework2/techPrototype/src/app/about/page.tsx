import { FaLinkedin, FaEnvelope } from "react-icons/fa"; // Import LinkedIn and Email icons

export default function About() {
    return (
        <div>
            {/* Centered Title */}
            <h1 className="text-3xl font-bold text-center border-b border-gray-300 pb-4">About MStock</h1>

            {/* Welcome Section */}
            <p className="mt-6 text-lg leading-relaxed">
                Welcome to MStock, a platform designed to simplify stock market analysis and predictions. This web
                application was created as part of an educational project for the Faculty of Computer Science and
                Engineering (FINKI) at the University of Ss. Cyril and Methodius in Skopje, North Macedonia. For more
                information about our institution, visit{" "}
                <a
                    href="https://www.finki.ukim.mk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    FINKI's official website
                </a>.
            </p>

            {/* Purpose Section */}
            <h2 className="text-2xl font-bold mt-8">Our Purpose</h2>
            <p className="mt-4 text-lg leading-relaxed">
                MStock aims to provide users with a comprehensive tool for analyzing stock trends, predicting future
                movements, and assessing market sentiment. The data for this platform is retrieved directly from the
                Macedonian Stock Exchange through open data sources. This allows us to deliver accurate and real-time
                insights into the performance of local companies, enabling better decision-making for educational and
                analytical purposes.
            </p>

            {/* Why MStock Section */}
            <h2 className="text-2xl font-bold mt-8">Why MStock?</h2>
            <p className="mt-4 text-lg leading-relaxed">
                Stock markets play a crucial role in modern economies, and understanding their patterns can be complex.
                MStock was developed to:
            </p>
            <ul className="list-disc list-inside mt-4 text-lg leading-relaxed">
                <li>Analyze technical indicators such as moving averages and oscillators.</li>
                <li>Evaluate market sentiment based on news analysis using Natural Language Processing (NLP).</li>
                <li>Predict future stock prices using advanced AI techniques like Long Short-Term Memory (LSTM) models.</li>
            </ul>
            <p className="mt-4 text-lg leading-relaxed">
                These features are tailored to provide users with actionable insights for academic, research, and
                educational purposes.
            </p>

            {/* Data Source Section */}
            <h2 className="text-2xl font-bold mt-8">Where Does the Data Come From?</h2>
            <p className="mt-4 text-lg leading-relaxed">
                The data powering MStock is obtained from publicly available sources, including the Macedonian Stock
                Exchange. All data is processed through an advanced pipeline architecture, which ensures its accuracy
                and relevance for users. The primary purpose of this platform is education—no financial decisions should
                be based on the insights provided here.
            </p>

            {/* Acknowledgments Section */}
            <h2 className="text-2xl font-bold mt-8">Acknowledgments</h2>
            <p className="mt-4 text-lg leading-relaxed">
                This project is part of the coursework for the Software Design and Architecture class at FINKI, focusing
                on implementing real-world software development practices. Special thanks to the professors and mentors
                who guided this process.
            </p>

            {/* Developer Information */}
            <p className="mt-8 text-lg leading-relaxed">
                This web application was developed by <strong>Tahir Zekiri</strong> as part of the academic journey at
                FINKI. For more information or to connect with me, feel free to reach out through the options below:
            </p>

            {/* Contact Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
                {/* LinkedIn Button */}
                <a
                    href="https://www.linkedin.com/in/tahirzekiri/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-6 py-3 w-48 h-12 border-2 border-blue-600 text-blue-600 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition"
                >
                    <FaLinkedin size={20}/>
                    <span>LinkedIn</span>
                </a>

                {/* Email Button */}
                <a
                    href="mailto:tahirzekiri@outlook.com"
                    className="flex items-center justify-center space-x-2 px-6 py-3 w-48 h-12 border-2 border-gray-700 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-700 hover:text-white transition"
                >
                    <FaEnvelope size={20}/>
                    <span>Email</span>
                </a>
            </div>
        </div>
    );
}