const Footer = () => {
  return (
    <footer className="bg-primary text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold">P</div>
          <span className="font-semibold">Performance Evaluation System</span>
        </div>
        <div className="text-blue-200 text-sm">
          &copy; {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
