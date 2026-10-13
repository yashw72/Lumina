import pytest
from app.services.loaders import clean_text, load_document


def test_clean_text():
    raw = "  Hello \x00 world!  \n\n\n\nThis   is  a\ttest.\n\n\nEnd.  "
    cleaned = clean_text(raw)
    assert "\x00" not in cleaned
    assert "This is a test." in cleaned
    assert "\n\n\n" not in cleaned
    assert cleaned.startswith("Hello world!")
    assert cleaned.endswith("End.")


def test_load_txt_file(tmp_path):
    file_path = tmp_path / "sample.txt"
    file_path.write_text("Line 1\n\nLine 2 with info.", encoding="utf-8")

    pages = load_document(str(file_path), "txt")
    assert len(pages) == 1
    assert pages[0]["page"] == 1
    assert "Line 1" in pages[0]["text"]
    assert "Line 2 with info." in pages[0]["text"]


def test_load_md_file(tmp_path):
    file_path = tmp_path / "notes.md"
    file_path.write_text("# Chapter 1\n\nSome notes here.", encoding="utf-8")

    pages = load_document(str(file_path), "md")
    assert len(pages) == 1
    assert pages[0]["page"] == 1
    assert "# Chapter 1" in pages[0]["text"]


def test_unsupported_file_type(tmp_path):
    file_path = tmp_path / "sample.xyz"
    file_path.write_text("Random content", encoding="utf-8")

    with pytest.raises(ValueError, match="Unsupported file type"):
        load_document(str(file_path), "xyz")


def test_empty_file_raises_error(tmp_path):
    file_path = tmp_path / "empty.txt"
    file_path.write_text("   \n\n   ", encoding="utf-8")

    with pytest.raises(ValueError, match="No text could be extracted"):
        load_document(str(file_path), "txt")
