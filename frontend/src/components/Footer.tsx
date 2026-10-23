import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-5 py-10 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-neutral-500 md:flex-row dark:text-neutral-400">
        <a href="#top" aria-label="Recio home"><Logo /></a>

        <ul className="flex flex-wrap justify-center gap-6">
          <li><a href="#features" className="hover:text-neutral-950 dark:hover:text-white">Features</a></li>
          <li><a href="#how-it-works" className="hover:text-neutral-950 dark:hover:text-white">How it works</a></li>
          <li><a href="#pricing" className="hover:text-neutral-950 dark:hover:text-white">Pricing</a></li>
          <li><a href="#faq" className="hover:text-neutral-950 dark:hover:text-white">FAQ</a></li>
        </ul>

        <p>© {new Date().getFullYear()} Recio</p>
      </div>
    </footer>
  )
}
