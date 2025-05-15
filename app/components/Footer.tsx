export default function Footer(): React.ReactElement {
  return (
    <footer
      className="w-full py-4 text-center text-sm text-gray-600 dark:text-gray-400
        bg-gray-100 dark:bg-gray-950 border-t border-gray-300 dark:border-gray-700"
    >
      Built by{" "}
      <a
        href="https://www.baileykane.co?ref=supplylibrary"
        target="_blank"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Bailey Kane
      </a>
      , for friends
    </footer>
  );
}
