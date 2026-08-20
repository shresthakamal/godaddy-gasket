// A root layout component is required for Next.js AppRouter to work.
// However, the path params are not available to the root.

export default function RootLayout(props) {
  return props.children;
}
