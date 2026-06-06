
/** Card wrapper */
const Card = ({ children }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 transition-shadow duration-200 hover:shadow-md">
        {children}
    </div>
);

export default Card;