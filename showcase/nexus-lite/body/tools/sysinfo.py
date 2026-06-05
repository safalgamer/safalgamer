import psutil
import platform
import time

def get_cpu_info():
    """Get CPU information."""
    try:
        # Prime psutil
        psutil.cpu_percent(interval=None)
        # Small sleep outside psutil
        time.sleep(0.1)
        # Read CPU
        cpu = psutil.cpu_percent(interval=None)
        return cpu
    except Exception:
        return None

def get_ram_info():
    """Get RAM information."""
    try:
        memory = psutil.virtual_memory()
        return memory.percent
    except Exception:
        return None

def get_disk_info():
    """Get disk information."""
    try:
        disk = psutil.disk_usage('C:\\')
        return disk.percent
    except Exception:
        return None

def get_processes():
    """Get list of running processes."""
    try:
        processes = []
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                processes.append(proc.info['name'])
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return processes[:20]  # Top 20
    except Exception:
        return []

def get_system_info() -> str:
    """Get comprehensive system info."""
    try:
        info = f"System: {platform.system()} {platform.release()}\n"
        info += f"CPU: {platform.processor()}\n"
        
        cpu = get_cpu_info()
        ram = get_ram_info()
        
        if cpu is not None:
            info += f"CPU: {cpu:.1f}%\n"
        if ram is not None:
            info += f"RAM: {ram:.1f}%\n"
        
        processes = get_processes()
        if processes:
            info += f"Processes: {', '.join(processes[:5])}\n"
        
        return info
    except Exception as e:
        return f"Error getting system info: {e}\n"
