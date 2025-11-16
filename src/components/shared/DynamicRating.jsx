import React from 'react';

const DynamicRating = ({ type, scale, icon, startLabel, endLabel }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= scale; i++) {
      stars.push(
        <div key={i} className="flex flex-col items-center">
          <span className="text-sm text-gray-600">{i}</span>
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center mt-1">
            ⭐
          </div>
        </div>
      );
    }
    return stars;
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= scale; i++) {
      hearts.push(
        <div key={i} className="flex flex-col items-center">
          <span className="text-sm text-gray-600">{i}</span>
          <div className="w-8 h-8 rounded-full border-2 border-pink-300 flex items-center justify-center mt-1 bg-pink-100">
            ❤️
          </div>
        </div>
      );
    }
    return hearts;
  };

  const renderEmojis = () => {
    const emojis = ['😡', '😟', '😐', '😊', '😄'];
    const emojiScale = Math.min(scale, 5); // Limit to 5 emojis
    const selectedEmojis = emojis.slice(0, emojiScale);

    return selectedEmojis.map((emoji, index) => (
      <div key={index} className="flex flex-col items-center">
        <span className="text-sm text-gray-600">{index + 1}</span>
        <div className="w-8 h-8 flex items-center justify-center mt-1 text-2xl">
          {emoji}
        </div>
      </div>
    ));
  };

  const renderLikertScale = () => {
    const range = [];
    for (let i = 1; i <= scale; i++) {
      range.push(i);
    }
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{startLabel || "Poor"}</span>
          <span>{endLabel || "Excellent"}</span>
        </div>
        <div className="flex justify-center items-center gap-2 mt-2">
          {range.map((num) => (
            <div key={num} className="flex flex-col items-center">
              <span className="text-sm text-gray-600">{num}</span>
              <div className="w-8 h-8 rounded-md border-2 border-gray-300 flex items-center justify-center mt-1">
                {num}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (type === 'Numeric Ratings') {
    return (
      <div className="flex justify-center items-center text-center gap-x-2 sm:gap-x-4">
        {icon === 'heart' && renderHearts()}
        {icon === 'star' && renderStars()}
        {icon === 'emoji' && renderEmojis()}
        {(!icon || !['heart', 'star', 'emoji'].includes(icon)) && renderStars()}
      </div>
    );
  }

  if (type === 'Likert Scale') {
    return renderLikertScale();
  }

  return null;
};

export default DynamicRating;
