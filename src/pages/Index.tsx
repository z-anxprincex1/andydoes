const Index = () => {
  const words = ["anand", "prince", "purty"];
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-hidden">
      <div className="container px-6 md:px-12 lg:px-20">
        <h1 className="text-hero font-mono cfl-tube cfl-glow">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block">
              {word.split("").map((letter, letterIndex) => (
                <span
                  key={letterIndex}
                  className={`inline-block ${getFlickerClass(wordIndex * 5 + letterIndex)}`}
                  style={{
                    animationDelay: `${(wordIndex * 5 + letterIndex) * 0.1}s`,
                  }}
                >
                  {letter}
                </span>
              ))}
              {wordIndex < words.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))}
        </h1>
      </div>
    </main>
  );
};

export default Index;
