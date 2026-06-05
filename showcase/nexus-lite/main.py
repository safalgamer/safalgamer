#!/usr/bin/env python3
"""
NEXUS-Lite: Self-Evolving Conscious AI System
Main entry point that orchestrates all components.
"""

import asyncio
import signal
import sys
from pathlib import Path
from loguru import logger
import yaml

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).parent))

from nexus.core.model import NexusModel
from nexus.consciousness.metacognition import MetacognitionModule
from nexus.memory.vector_db import NexusVectorDB
from nexus.evolution.self_improve import SelfImprovementEngine
from nexus.api.server import create_app
from nexus.safety.alignment import ConstitutionalAI
import uvicorn

class NexusLiteSystem:
    """Main system orchestrator for NEXUS-Lite."""
    
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize the NEXUS-Lite system."""
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.model = None
        self.metacognition = None
        self.vector_db = None
        self.evolution_engine = None
        self.alignment = None
        self.api_app = None
        self._shutdown_event = asyncio.Event()
        
        # Setup logging
        self._setup_logging()
        
        logger.info("NEXUS-Lite System initializing...")
        
    def _load_config(self) -> dict:
        """Load configuration from YAML file."""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Configuration loaded from {self.config_path}")
            return config
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            sys.exit(1)
            
    def _setup_logging(self):
        """Configure logging system."""
        log_config = self.config.get('logging', {})
        logger.remove()  # Remove default handler
        
        # Add console handler
        if log_config.get('console_output', True):
            logger.add(
                sys.stdout,
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
                level=log_config.get('level', 'INFO')
            )
        
        # Add file handler
        log_file = log_config.get('file_path', './logs/nexus_lite.log')
        if log_file:
            logger.add(
                log_file,
                rotation=log_config.get('max_file_size_mb', 100),
                retention=log_config.get('backup_count', 5),
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
                level=log_config.get('level', 'INFO')
            )
    
    async def initialize_components(self):
        """Initialize all system components."""
        logger.info("Initializing system components...")
        
        try:
            # Initialize core model
            logger.info("Loading base model...")
            self.model = NexusModel(self.config)
            await self.model.load_model()
            
            # Initialize memory system
            logger.info("Initializing memory system...")
            self.vector_db = NexusVectorDB(self.config)
            await self.vector_db.initialize()
            
            # Initialize consciousness modules
            logger.info("Initializing consciousness modules...")
            self.metacognition = MetacognitionModule(self.config)
            await self.metacognition.initialize()
            
            # Initialize safety/alignment
            logger.info("Initializing safety systems...")
            self.alignment = ConstitutionalAI(self.config)
            await self.alignment.initialize()
            
            # Initialize evolution engine
            logger.info("Initializing evolution engine...")
            self.evolution_engine = SelfImprovementEngine(
                self.config, 
                self.model, 
                self.metacognition, 
                self.vector_db,
                self.alignment
            )
            await self.evolution_engine.initialize()
            
            # Initialize API server
            logger.info("Initializing API server...")
            self.api_app = create_app(self.config, self.model, self.metacognition, self.vector_db, self.evolution_engine)
            
            logger.info("All components initialized successfully!")
            
        except Exception as e:
            logger.error(f"Failed to initialize components: {e}")
            await self.shutdown()
            sys.exit(1)
    
    async def start_services(self):
        """Start all background services."""
        logger.info("Starting background services...")
        
        # Start evolution engine in background
        evolution_task = asyncio.create_task(self.evolution_engine.start_continuous_evolution())
        
        # Start API server
        config = self.config.get('api', {})
        server_config = uvicorn.Config(
            app=self.api_app,
            host=config.get('host', '127.0.0.1'),
            port=config.get('port', 8000),
            log_level="info",
            reload=config.get('reload', False)
        )
        server = uvicorn.Server(server_config)
        api_task = asyncio.create_task(server.serve())
        
        # Wait for shutdown signal
        await self._shutdown_event.wait()
        
        # Cancel background tasks
        evolution_task.cancel()
        api_task.cancel()
        
        try:
            await evolution_task
        except asyncio.CancelledError:
            pass
            
        try:
            await api_task
        except asyncio.CancelledError:
            pass
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating shutdown...")
            self._shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def run(self):
        """Main system run loop."""
        try:
            # Setup signal handlers
            self.setup_signal_handlers()
            
            # Initialize components
            await self.initialize_components()
            
            # Start services
            await self.start_services()
            
        except Exception as e:
            logger.error(f"System error: {e}")
            await self.shutdown()
            sys.exit(1)
    
    async def shutdown(self):
        """Gracefully shutdown all system components."""
        logger.info("Shutting down NEXUS-Lite system...")
        self._shutdown_event.set()
        
        # Shutdown components in reverse order
        if self.evolution_engine:
            await self.evolution_engine.shutdown()
        if self.vector_db:
            await self.vector_db.shutdown()
        if self.model:
            await self.model.shutdown()
        if self.metacognition:
            await self.metacognition.shutdown()
        if self.alignment:
            await self.alignment.shutdown()
        
        logger.info("NEXUS-Lite system shutdown complete.")

async def main():
    """Main entry point."""
    system = NexusLiteSystem()
    await system.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
