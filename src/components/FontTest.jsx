function FontTest() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="font-middleearth text-3xl">
        This text should be in Middle-earth font
      </h1>
      <h1 className="font-tolkien text-3xl">
        This text should be in Tolkien font
      </h1>
      {/* Regular text for comparison */}
      <h1 className="text-3xl">This is regular text</h1>
    </div>
  );
}

export default FontTest;
