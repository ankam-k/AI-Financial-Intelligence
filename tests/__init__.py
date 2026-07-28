"""Test suite.

A package rather than a loose directory so test modules can share builders by
importing them (``from tests.analysis.conftest import dataset``). Without
``__init__.py``, pytest imports each test file as a top-level module and that
import path does not resolve.
"""
