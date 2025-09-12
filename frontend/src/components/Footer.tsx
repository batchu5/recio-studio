export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-300 py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      
        <div className="text-lg font-bold text-white">
          Recio
        </div>

        <ul className="flex gap-6 text-sm">
          <li><a href="#home" className="hover:text-white">Home</a></li>
          <li><a href="#features" className="hover:text-white">Features</a></li>
          <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
          <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
        </ul>

        <div className="flex gap-4">
          <a href="#" aria-label="Twitter" className="hover:text-white">Twitter</a>
          <a href="#" aria-label="GitHub" className="hover:text-white">Github</a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white">LinkedIn</a>
        </div>
      </div>

    </footer>
  )
}
