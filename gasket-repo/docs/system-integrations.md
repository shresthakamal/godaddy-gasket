# Gasket Integrations Overview

Gasket is a framework that glues together various technologies and services to provide a consistent development experience for building web applications at GoDaddy. It serves as the first point of contact for many issues and provides a standardized way to integrate with GoDaddy's core systems.

Key benefits of using Gasket:
- Rapid application setup with standardized configurations
- Integration with GoDaddy's core services out of the box
- Consistent developer and user experience across GoDaddy applications
- Built-in support for common requirements like authentication, localization, and analytics

## GoDaddy Systems

Gasket integrates with several GoDaddy services to provide a comprehensive development framework.
Below is an overview of these services and how Gasket connects with them.

### Authentication Platform (SSO)

**Description**: The Authentication Platform, also known as SSO (Single Sign-On), is a service for authenticating both GoDaddy customers and internal employees.

**Integration**: Gasket integrates with the Authentication Platform through the `@godaddy/gasket-plugin-auth` plugin, which provides:
- Auth-related middleware and express endpoints
- React components for enforcing authorization rules
- Support for various authentication realms (idp, jomax, pass, cert, awsiam)
- Token management and validation

**Resources**
- [Authentication Platform Docs](https://godaddy-corp.atlassian.net/wiki/spaces/AUTH/pages/89656000/Integration+Guide)
- Slack: [#sso-support](https://godaddy.enterprise.slack.com/archives/C04BJ6SJA)

### Presentation Central

**Description**: Presentation Central is a service for retrieving page content common across GoDaddy websites, such as headers, footers, and navigation menus.

**Integration**: Gasket integrates with Presentation Central through the `@godaddy/gasket-plugin-uxp` plugin, which provides:
- Configuration options for Presentation Central API
- Caching mechanisms for Presentation Central responses
- Support for different environments and API versions
- Theme customization options

**Resources**
- [Presentation Central Repo](https://github.com/gdcorp-uxp/presentation-central)
- Slack: [#uxcore2-support](https://godaddy.enterprise.slack.com/archives/C16EW70JV)

### Shared Header Service

**Description**: The Shared Header service provides the application header that is shared across the W+M, Commerce and MyA products.
It acts as a proxy to Presentation Central, allowing applications to retrieve header content based on different identification methods such as website ID, venture ID, business ID, or store ID.

**Integration**: Gasket integrates with Shared Header through the `@godaddy/gasket-plugin-shared-header` plugin, which provides:
- A `getSharedHeader` action to fetch header content
- A `sharedHeader` lifecycle hook for customizing requests
- Configuration options for the Shared Header client
- Support for different site types (blogs, commerce, etc.)
- Runtime overriding of UXCore versions for testing

**Resources**
- Slack: [#pnc-shared-headers](https://godaddy.enterprise.slack.com/archives/C98H043GA)

### UXCore2

**Description**: UXCore2 is a collection of React components that applications can use to create a user experience consistent with other GoDaddy websites.

**Integration**: Gasket integrates with UXCore2 through the `@godaddy/gasket-plugin-uxp` plugin, which provides:
- Webpack configuration for UXCore2 components
- Support for UXCore2 styles and themes
- CSS import capabilities for distributed styles

**Resources**
- [UXCore2 Docs](https://uxcore.uxp.gdcorp.tools)
- [UXCore2 Repo](https://github.com/gdcorp-uxp/uxcore2)
- Slack: [#uxcore2-support](https://godaddy.enterprise.slack.com/archives/C16EW70JV)

### GoDaddy Traffic

**Description**: GoDaddy Traffic provides behavioral analytics, real user performance monitoring (RUM), and experiment tracking.

**Integration**: Gasket integrates with GoDaddy Traffic through the `@godaddy/gasket-plugin-traffic` plugin, which provides:
- Configuration for Traffic settings
- Integration with Presentation Central to ensure Traffic is included in web applications

**Resources**
- [Web Instrumentation Docs](https://godaddy-corp.atlassian.net/wiki/spaces/CKPT/pages/92315500/Web+Instrumentation)
- Slack: [#traffic](https://godaddy.enterprise.slack.com/archives/C0J9L0JKS)

### GoDaddy Localization Framework (GoLF)

**Description**: GoLF is an automatic hand-off/hand-back text translation system for localizing content.

**Integration**: Gasket integrates with GoLF through the Intl Plugin, which provides:
- Automatic bundling of localization artifacts
- Dynamic download of localized text based on users' market locale
- Integration with react-intl components

**Resources**
- [GoLF Docs](https://confluence.godaddy.com/display/GDI/GoLF+-+GoDaddy+Localization+Framework)
- Slack: [#golf](https://godaddy.enterprise.slack.com/archives/C07TDQWJ1)

### GoCaaS (GoDaddy Content as a Service)

**Description**: GoCaaS is a service that acts as a centralized platform to encompass various generative AI technologies.

**Integration**: Gasket integrates with GoCaaS through the `@godaddy/gasket-plugin-gocaas` plugin, which provides:
- Client for interacting with GoCaaS
- Integration with Gasket's lifecycle hooks

**Resources**
- [GoCaaS Docs](https://caas.api.godaddy.com/docs/)
- Slack: [#go-caas](https://godaddy.enterprise.slack.com/archives/C050KMVPQ49)

### Switchboard

**Description**: Switchboard is a service for feature flagging and experimentation.

**Integration**: Gasket integrates with Switchboard through the `@godaddy/gasket-plugin-switchboard` plugin, which provides:
- Configuration for Switchboard integration
- Browser state management for Switchboard
- Per-request parameter handling

**Resources**
- [Switchboard Platform Docs](https://tdl.gdcorp.tools/docs/products/developer-tools/product-experience/switchboard/)
- Slack: [#switchboard-support](https://godaddy.enterprise.slack.com/archives/C3C16UERG)

### Header Content Service (HCS)

**Description**: Header Content Service provides header content for GoDaddy applications.

**Integration**: Gasket integrates with HCS through the `@godaddy/gasket-plugin-hcs` plugin, which provides:
- Configuration for HCS integration
- Caching mechanisms for HCS responses
- Interacts with Platform Content Service

**Resources**
- Slack: [#uxcore2-support](https://godaddy.enterprise.slack.com/archives/C16EW70JV)
