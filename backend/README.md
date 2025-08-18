# Wempy Restaurant Website

Wempy is a demo web application for a traditional Egyptian restaurant. It offers a modern, user-friendly interface in Arabic (RTL), allowing customers to:

- Browse a digital food and drinks menu
- Add items to a shopping cart
- Review and edit their order
- Submit their order online for processing

The project includes a simple backend that receives and stores customer orders. Wempy is ideal as a starting point for anyone building an online ordering system for local restaurants, with support for Arabic language and right-to-left layouts.
- Price fields in JSON may be ranges like `15-20` for sandwiches; the UI uses the minimum price as the default for quick ordering.
- Sandwich images: If not available yet, an empty image space may appear. You can add images later under `images/sandwiches/` or update image paths in the JSON files.
- Currency/fees can be adjusted later in the UI or when building the order.
## Features
- **Responsive Design**: Works on both desktop and mobile devices.
- **RTL Support**: Fully supports Arabic language and right-to-left text direction.
- **Dynamic Menu**: Menu items are loaded from JSON files, making it easy to update
