"""
الملف دا يحتوي الرسائل الثابته التي تظهر للمستخدم عند اي عملية فقط
-> لما ننده ال response messages must => FILE_SIZE_EXCEEDED.value => عشان احصل على المحتوى الداخي
"""

from enum import Enum

class ResponseMessages(Enum):
    RESTAURANT_TITLE = 'Wempy Order & Print Server✅'
    HTML_SERVER_SUCCESS = "Wempy Order Service Ready✅"
    PROCESSING_ORDER_FAILED = "ERROR: Order processed failed"
    PRINTER_SUPPORTED_WINDOWS = "Printer supported on Windows"
    PRINTER_FILE_NOT_FOUND = "Printer file not found"

 