package de.hska.iwi.solutions.search;

import de.hska.iwi.ads.search.Search;

public class BinarySearch<E extends Comparable<E>> implements Search<E> {

	private int normalBinSearch(E[] a, E key, int left, int right) {
		if (left > right) {
			return right + 1;
		}
		int ret = -2;
		int mid = (right + left) / 2;
		if ((a[mid]).compareTo(key) == 0) {
			ret = mid;
		}
		if ((a[mid]).compareTo(key) <= 0) {
			ret =  normalBinSearch(a, key, (mid + 1), right);
		}
		if ((a[mid]).compareTo(key) >= 0) {
			ret = normalBinSearch(a, key, left, (mid - 1));
		}
		return ret;
	}

	@Override
	public int search(E[] a, E key, int left, int right) {
		int i;
		if (key.compareTo(a[left]) < 0 ) {
			i = left - 1;
		}
		else if (key.compareTo(a[right]) > 0 ) {
			i = right + 1;
		}
		else {
			i = normalBinSearch(a, key, left, right);
		}
		return i;
	}
}
