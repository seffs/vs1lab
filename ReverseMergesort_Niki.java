package de.hska.iwi.ads.solution.sorting;

import de.hska.iwi.ads.sorting.AbstractMergesort;
import de.hska.iwi.ads.solution.sorting.ReverseArray;

public class ReverseMergesort<E extends Comparable<E>> extends AbstractMergesort<E> {

	@Override
	protected void mergesort(E[] a, int left, int right) {
		if (left < right) {
			int m = (left + right) / 2;
			mergesort(a, left, m);
			mergesort(a, m + 1, right);
			reverse(a, m + 1, right);
			reverseMerge(a, b, left, m, right);
		}
	}

	private void reverse(E[] a, int from, int to) {
		ReverseArray<E> rev = new ReverseArray<>();
		rev.reverse(a, from, to);

	}

  /** Die Sonderfälle in der if-Abfrage beim Verschmelzen kann man bei einem
  umgekehrten rechten Teil des Arrays einfach weglassen. Der Algorithmus
  funktioniert dann immer noch fehlerfrei.*/
	void reverseMerge(E[] a, E[] b, int left, int m, int right) {
		int l = left;
		int r = right;
		for (int i = left; i <= right; i++) {
			if (a[l].compareTo(a[r]) <= 0) {
				b[i] = a[l];
				l++;
			} else {
				b[i] = a[r];
				r--;
			}
		}
		for (int i = left; i <= right; i++) {
			a[i] = b[i];
		}
	}
}
