# What is new

**Announcing Gasket v7: Simplified, Flexible, and Fully Integrated**

🍿 _Check out the [Gasket 7 Hype Video] for an overview!_

We are thrilled to announce the next major release of Gasket, packed with
powerful new features, improvements, and optimizations that make building
applications with Gasket easier and more flexible than ever before.

> Our internal `@godaddy/gasket-*` scoped packages that supporting Gasket v7
> features are now at version `3.x`. See the [releases] page for more details.

This release introduces a range of enhancements that help launch your development
experience to new heights.

## Key Updates in Gasket v7

### **Less Magic, More Transparency**
In Gasket v7, we’ve taken significant steps to reduce the magic and increase
transparency, providing developers with a more intuitive and straightforward
development experience. One of the key changes is the removal of "magic files"
in the `lifecycles` directory. This reduces the complexity around Gasket
lifecycles and makes it easier to understand and customize the behavior of your
Gasket applications.

### **Framework-First Approach: No More Gasket CLI**

Gasket v7 no longer relies on the Gasket CLI for core tasks. Instead, we now
delegate responsibilities such as transpilation, bundling, and other
optimizations to the primary framework in use. This shift allows the core
framework to handle crucial tasks, making your Gasket apps lighter, faster,
and better aligned with the ecosystem you’re already using.

### **ESM-Ready**

Gasket apps are now fully aligned with ECMAScript Modules (ESM), bringing modern
JavaScript standards to the forefront of the development process. This allows
for more modular, future-proof codebases and better integration with modern
build systems.

### **Full TypeScript Support**

Whether you’re building Gasket apps or in-app plugins, Gasket v7 now offers
full support for TypeScript. This update improves both development speed and
reliability, with enhanced type checking, better tooling, and internal JSDoc
typings for a smoother TypeScript experience across the board.

### **Next.js 14 Support**

We’re proud to announce full support for Next.js 14, with both the App Router
and Page Router, as well as a custom server option for more advanced routing
needs. This unlocks using React Server Components and other potential future
features of Next.js.

While Gasket v7 unblocks App Router with React Server Components, using it to
meet our app requirements at GoDaddy is still ongoing.
If you want to get involved, chime in the [#gasket-dev] channel on Slack. 

### **Introducing Gasket Actions**

A major new feature in v7 is **Gasket Actions** — a powerful new pattern for
accessing and setting data on demand in Gasket applications. This feature
reduces the need to decorate `req`/`res` objects or rely on middleware,
offering a cleaner, more flexible method to manage application data.
Gasket Actions provide a reliable and intuitive way to work with dynamic data
without adding complexity to your app’s architecture.

### **Increased Flexibility and Portability**

Gasket v7 is now more flexible and portable, taking a less opinionated approach
to app development. By eliminating the need for the Gasket CLI, you can simply
import Gasket wherever you need it. Additionally, users now have the ability to
create multiple Gasket instances, offering greater versatility and control in
how you structure your applications. We've made it easier than ever to integrate
Gasket with the frameworks and tools you already know and love.

### **Easier Contributions**

We’ve aligned our testing framework with Jest, one of the most widely used
testing libraries in the JavaScript ecosystem.
We have refined our TypeScript types and connected them with the code using
JSDoc imports to assist in better code completion and type checking,
without sacrificing the debug ability of JavaScript.

### What’s Next?

The release of Gasket v7 marks a significant milestone in our journey to provide
a powerful, flexible, and developer-friendly framework. Whether you're working
with JavaScript or TypeScript, server-side or client-side rendering, Gasket v7
gives you the tools you need to build applications faster and with more
flexibility than ever before.

Follow the [Upgrade Guide] today and explore the new features and improvements
that make Gasket v7 the best version yet. Happy coding!

[#gasket-dev]: https://godaddy.enterprise.slack.com/archives/C9PEPF709
[releases]: releases.md
[Upgrade Guide]: upgrade-to-7.md
[Gasket 7 Hype Video]: https://secureservernet.sharepoint.com/:v:/t/product-frameworks-dev/EaPWXm_pneZCgwK2kXcmi9sBoLlpOv_r5GyApXzIOKEHrw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=ypcpgm
