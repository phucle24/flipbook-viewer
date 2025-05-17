import type React from 'react';
import type { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  return (
    <div
      className="storybook-card group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full aspect-4/3 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

        {/* Read Story Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white text-gray-800 font-medium px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
            Read Story
          </button>
        </div>
      </div>

      {/* Story Details */}
      <div className="p-6 bg-pastel-pink/60 rounded-b-2xl shadow-md font-serif">
        <h3 className="font-extrabold text-2xl mb-2 truncate text-pastel-purple drop-shadow-sm">{story.title}</h3>
        <p className="text-base text-pastel-blue mb-3 font-medium drop-shadow-sm">by {story.author}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-pastel-yellow/70 text-pastel-green font-semibold shadow"
            >
              {tag}
            </span>
          ))}
          {story.tags.length > 3 && (
            <span className="px-3 py-1 text-xs rounded-full bg-pastel-yellow/70 text-pastel-green font-semibold shadow">
              +{story.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-base text-pastel-purple font-semibold drop-shadow-sm">
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pastel-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{story.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pastel-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{story.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
