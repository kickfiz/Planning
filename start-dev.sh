#!/bin/bash

# Start Time Tracker Application in Development Mode

echo "🚀 Starting Time Tracker Application..."
echo ""
echo "✅ Both servers will start concurrently"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Run both servers with concurrently
npm run dev
